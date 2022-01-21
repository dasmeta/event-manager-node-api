const { Datastore } = require("@google-cloud/datastore");

// const datastore = new Datastore({ projectId: process.env.GCLOUD_PROJECT });
const datastore = new Datastore({ projectId: "valued-bastion-137423" });
// const verbose = process.argv.includes("-v");

const calculateStats = async (topic, subscription, eventId, proccess) => {
    const kind = "event-stats";
    const topicKey = datastore.key([kind, topic]);
    const key = datastore.key([kind, `${topic}:${subscription}`]);

    const transaction = datastore.transaction();
    await transaction.run();

    const [
        topicItem = {
            topic,
            type: "topic",
            total: 0,
            successCount: 0,
            failCount: 0,
            inProgressCount: 0,
            fail: [],
            inProgress: [],
            subscriptions: {},
        },
    ] = await transaction.get(topicKey);

    const [
        item = {
            topic,
            subscription,
            type: "subscription",
            total: 0,
            successCount: 0,
            failCount: 0,
            inProgressCount: 0,
            fail: [],
            inProgress: [],
        },
    ] = await transaction.get(key);

    proccess(item);

    const properties = ["total", "successCount", "failCount", "inProgressCount"];
    topicItem.subscriptions[subscription] = properties.reduce((acc, key) => {
        acc[key] = item[key];
        return acc;
    }, {});

    const arr = Object.values(topicItem.subscriptions);
    properties.forEach(property => {
        topicItem[property] = arr.reduce((acc, sub) => acc + sub[property], 0);
    });

    transaction.save({
        key,
        method: "upsert",
        data: { ...item },
    });

    transaction.save({
        key: topicKey,
        method: "upsert",
        data: { ...topicItem },
    });

    const exec = async () => {
        try {
            await transaction.commit();
        } catch (e) {
            await exec();
        }
    };

    await exec();
};

module.exports = {
    async createEvent(topic, traceId, data, dataSource) {
        const kind = "event";
        const eventKey = datastore.key(kind);
        const now = new Date();

        const entity = {
            key: eventKey,
            data: {
                topic,
                traceId,
                data,
                dataSource,
                createdAt: now,
                updatedAt: now,
            },
        };

        await datastore.insert(entity);

        return entity.key.id;
    },

    async updateEvent(eventId, data) {
        const kind = "event";
        const eventKey = datastore.key(kind);
        eventKey.id = eventId;
        const updatedAt = new Date();

        const transaction = datastore.transaction();
        await transaction.run();

        const [event] = await transaction.get(eventKey);

        transaction.save({
            key: eventKey,
            method: "update",
            data: { ...event, ...data, updatedAt },
        });

        await transaction.commit();
    },

    async upsertEventSubscription(eventId, subscription, data) {
        const kind = "event-subscription";
        const now = new Date();
        const key = datastore.key([kind, `${eventId}:${subscription}`]);

        const transaction = datastore.transaction();
        await transaction.run();

        const [item = { createdAt: now }] = await transaction.get(key);

        const entity = {
            key,
            method: "upsert",
            data: {
                ...item,
                ...data,
                updatedAt: now,
            },
        };

        transaction.save(entity);

        await transaction.commit();
    },

    async stateInProgress(topic, subscription, eventId) {
        await calculateStats(topic, subscription, eventId, item => {
            const { inProgress, fail } = item;

            if (!inProgress.includes(eventId) && !fail.includes(eventId)) {
                item.inProgress.push(eventId);
                item.inProgressCount += 1;
                item.total += 1;
            }

            if (fail.includes(eventId)) {
                item.fail.splice(fail.indexOf(eventId), 1);
                item.failCount -= 1;
                item.inProgress.push(eventId);
                item.inProgressCount += 1;
            }
        });
    },

    async stateFail(topic, subscription, eventId) {
        await calculateStats(topic, subscription, eventId, item => {
            const { inProgress, fail } = item;

            if (inProgress.includes(eventId)) {
                item.inProgress.splice(fail.indexOf(eventId), 1);
                item.inProgressCount -= 1;
            }

            if (!fail.includes(eventId)) {
                item.fail.push(eventId);
                item.failCount += 1;
            }
        });
    },

    async stateSuccess(topic, subscription, eventId) {
        await calculateStats(topic, subscription, eventId, item => {
            const { inProgress, fail } = item;

            if (inProgress.includes(eventId)) {
                item.inProgress.splice(fail.indexOf(eventId), 1);
                item.inProgressCount -= 1;
            }

            if (fail.includes(eventId)) {
                item.fail.splice(fail.indexOf(eventId), 1);
                item.failCount -= 1;
            }

            item.successCount += 1;
        });
    },
};
