# @dasmeta/microservice #

Extended event publishing PubSub/Kafka package.

`yarn add @dasmeta/event-manager-node-api`

### start local pub/sub

`$ gcloud beta emulators pubsub start`
`$ DATASTORE_EMULATOR_HOST=localhost:8432 DATASTORE_PROJECT_ID=YOUR_GCLOUD_PROJECT_ID gcloud beta emulators datastore start`



#### example1.js
```
const { registerSubscriber, publish } = require("@dasmeta/event-manager-node-api");

async function test1(data) {
    console.log("test1", data);
}

async function test2(data) {
    console.log("test2", data);
}

async function test3(data) {
    console.log("test3", data);
}

registerSubscriber("dev.test", "dev-test_test1", test1);
registerSubscriber("dev.test", "dev-test_test2", test2);
registerSubscriber("dev.test.other", "dev-test_test3", test3);

setInterval(async () => {
    await publish("dev.test", { key: Date.now() });
}, 300);

setInterval(async () => {
    await publish("dev.test.other", { key2: Date.now() });
}, 500);

```

`PUBSUB_EMULATOR_HOST="localhost:8085" PUBSUB_PROJECT_ID="YOUR_GCLOUD_PROJECT_ID" GCLOUD_PROJECT="YOUR_GCLOUD_PROJECT_ID" node example1.js`

#### example2.js
```
const { publish, subscribeMulti } = require("@dasmeta/event-manager-node-api");


function subscribe1() {
    subscribeMulti("test", ["dev.test", "dev.test.other"], async (topic, data) => {
        console.log('\x1b[31m%s %s\x1b[0m', " 1 ", topic, data);
    });
}

function subscribe2() {
    // resubscribe
    subscribeMulti("test", ["dev.test"], async (topic, data) => {
        console.log('\x1b[32m%s %s\x1b[0m', " 2 ", topic, data);
    });

    subscribeMulti("test3", ["dev.test", "dev.test.other"], async (topic, data) => {
        console.log('\x1b[33m%s %s\x1b[0m', " 3 ", topic, data);
    });
}


setInterval(async () => {
    await publish("dev.test", { key: Date.now() });
}, 200);

setInterval(async () => {
    await publish("dev.test.other", { key2: Date.now() });
}, 300);

subscribe1();

setTimeout(async () => {
    subscribe2();
}, 20 * 1000);

```

`PUBSUB_EMULATOR_HOST="localhost:8085" PUBSUB_PROJECT_ID="YOUR_GCLOUD_PROJECT_ID" GCLOUD_PROJECT="YOUR_GCLOUD_PROJECT_ID" node example2.js`

#### example3.js
```
import { autoStart as AutoStart, subscribe as on, publish } from "@dasmeta/event-manager-node-api";

@AutoStart
class Example {
    @on("dev.test")
    async test1(data) {
        console.log("test1", data);
    }

    @on("dev.test")
    async test2(data) {
        console.log("test2", data);
    }

    @on("dev.test.other")
    async test3(data) {
        console.log("test3", data);
    }
}

setInterval(async () => {
    await publish("dev.test", { key: Date.now() });
}, 300);

setInterval(async () => {
    await publish("dev.test.other", { key2: Date.now() });
}, 500);

```

`PUBSUB_EMULATOR_HOST="localhost:8085" PUBSUB_PROJECT_ID="YOUR_GCLOUD_PROJECT_ID" GCLOUD_PROJECT="YOUR_GCLOUD_PROJECT_ID" node example3.js`

#### Kafka : run all examples with env variables 
`MQ_CLIENT_NAME='Kafka' KAFKA_BROKERS='127.0.0.1:29092'`

#### PubSub : run all examples with env variables 
`PUBSUB_EMULATOR_HOST="localhost:8085" PUBSUB_PROJECT_ID="YOUR_GCLOUD_PROJECT_ID" GCLOUD_PROJECT="YOUR_GCLOUD_PROJECT_ID"`
