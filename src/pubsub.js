const EventEmitter = require("events");
const { PubSub } = require("@google-cloud/pubsub/build/src/index");
const logger = require("./helper/logger");

const mqClient = new PubSub({ projectId: process.env.GCLOUD_PROJECT });

const topicsMap = new Map();
const topicsWaiting = new Map();

class TopicEmitter extends EventEmitter {}
const topicEmitter = new TopicEmitter();

async function getTopic(topicName) {
    if (topicsMap.has(topicName)) {
        return mqClient.topic(topicName);
    }

    if (topicsWaiting.has(topicName)) {
        return new Promise(resolve => {
            topicEmitter.setMaxListeners(topicEmitter.getMaxListeners() + 1);
            topicEmitter.once(topicName, () => {
                resolve(mqClient.topic(topicName));
                topicEmitter.setMaxListeners(Math.max(topicEmitter.getMaxListeners() - 1, 0));
            });
        });
    }
    topicsWaiting.set(topicName, true);
    const topic = mqClient.topic(topicName);
    const [exists] = await topic.exists();
    if (!exists) {
        if (logger.isDebug()) {
            logger.debug(`TOPIC "${topicName}" NOT EXISTS, creating...`);
            logger.timeStart(`TOPIC CREATED "${topicName}"`);
        }
        await topic.create();
        if (logger.isDebug()) {
            logger.timeEnd(`TOPIC CREATED "${topicName}"`);
        }
    }
    topicsMap.set(topicName, true);
    topicsWaiting.delete(topicName);
    topicEmitter.emit(topicName);
    return mqClient.topic(topicName);
}

async function getSubscription(topicName, subscriptionName) {
    const topic = await getTopic(topicName);
    const subscription = topic.subscription(subscriptionName);
    const [exists] = await subscription.exists();
    if (!exists) {
        if (logger.isDebug()) {
            logger.debug(`SUBSCRIPTION "${subscriptionName}" NOT EXISTS, creating...`);
            logger.timeStart(`SUBSCRIPTION CREATED "${subscriptionName}"`);
        }
        //const [subscription /*, apiResponse*/] =
        await mqClient.createSubscription(topic, subscriptionName, {
            flowControl: {
                maxMessages: 1,
            },
            ackDeadlineSeconds: 60, // max 10 min
            //messageRetentionDuration: 4 * 60 * 60, // max 7 day
            //retainAckedMessages: true,
        });
        if (logger.isDebug()) {
            logger.timeEnd(`SUBSCRIPTION CREATED "${subscriptionName}"`);
        }
        return topic.subscription(subscriptionName);
    }
    return subscription;
}

module.exports = {
    getTopic,
    getSubscription,
};
