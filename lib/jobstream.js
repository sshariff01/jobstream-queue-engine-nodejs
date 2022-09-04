import logger from '../init/logger.js';
import { base64Decode } from "./encoding.js";

import SqsClient from "./sqsClient.js";

class Jobstream {
    constructor({ queueName }) {
        this.client = new SqsClient({ queueName });
    }

    async enqueue({ message }) {
        return this.client.writeToQueue({ message });
    }

    async dequeue() {
        const dequeuedMessage = await this.client.readFromQueue();

        if (!dequeuedMessage) {
            return;
        }

        const decodedMessage = base64Decode(dequeuedMessage.Body);
        const processed = await this.process({ message: decodedMessage });

        if (processed) {
            await this.client.deleteFromQueue({ message: dequeuedMessage });
            return processed;
        }
    }

    async process({ message }) {
        logger.info(`Message read from queue: ${message}`);

        return true;
    }
}

export default Jobstream;