const { MongoClient } = require("mongodb");
const EventEmitter = require("events");

class ConnectionEmitter extends EventEmitter {}
const connectionEmitter = new ConnectionEmitter();

const state = {
    waiting: false,
    connection: null,
};

const getConnection = async () => {
    if (state.connection) {
        return state.connection;
    }
    if (state.waiting) {
        return new Promise(resolve => {
            connectionEmitter.setMaxListeners(connectionEmitter.getMaxListeners() + 1);
            connectionEmitter.once("connected", () => {
                resolve(state.connection);
                connectionEmitter.setMaxListeners(Math.max(connectionEmitter.getMaxListeners() - 1, 0));
            });
        });
    }
    state.waiting = true;

    const { username, password, host, port, db } = getOptions();
    const url = `mongodb://${username || password ? `${username}:${password}@` : ""}${host}:${port}/${db}`;

    const connection = await MongoClient.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    state.connection = connection;
    state.waiting = false;
    connectionEmitter.emit("connected");
    return connection;
};

const getOptions = () => {
    const username = process.env["MONGODB_EVENT_USERNAME"] || "";
    const password = process.env["MONGODB_EVENT_PASSWORD"] || "";
    const host = process.env["MONGODB_EVENT_HOST"] || "localhost";
    const port = process.env["MONGODB_EVENT_PORT"] || 27017;
    const db = process.env["MONGODB_EVENT_DB"] || "event";
    return { username, password, host, port, db };
};
const getDb = async () => {
    const connection = await getConnection();
    return connection.db(getOptions().db);
};

module.exports = {
    async getCollection(name) {
        const db = await getDb();
        return db.collection(name);
    },
};
