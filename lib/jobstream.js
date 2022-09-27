import logger from '../init/logger.js';
import { base64Decode } from "./encoding.js";

import QueueConfig from "./queueConfig.js";
import SqsClient from "./sqsClient.js";

class Jobstream {
    constructor({ workerId, config } = { workerId: null, config }) {
        this.client = new SqsClient({
            queueName: config.queueName(),
            awsRegion: config.awsRegion(),
            awsAccountId: config.awsAccountId(),
        });
        const log = (() => {
            if (workerId) {
                return logger.child({ workerId: workerId });
            }
            return logger;
        })();
        this.logger = log;
    };

    async enqueue({ message }) {
        return this.client.writeToQueue({ message });
    }

    async dequeue() {
        const dequeuedMessage = await this.client.readFromQueue();

        if (!dequeuedMessage) {
            return;
        }

        const decodedMessage = base64Decode(dequeuedMessage.Body);
        const processed = await this.perform({ message: decodedMessage });

        if (processed) {
            await this.client.deleteFromQueue({ message: dequeuedMessage });
            return processed;
        }
    }

    async perform({ message }) {
        logger.info(`Message read from queue: ${message}`);

        return true;
    }

    static async create({ workerId } = { workerId: null }) {
        const log = (() => {
            if (workerId) {
                return logger.child({ workerId: workerId });
            }
            return logger;
        })();

        const config = await QueueConfig.initConfig({
            filePath: this.configFilePath(),
            logger: log
        });

        return new this({ workerId, config });
    }

    static configFilePath() {
        throw new Error('configFilePath() method must be defined in jobstream subclass');
    }
}

export default Jobstream;