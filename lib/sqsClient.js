// ES6+ example
import { SQSClient, ReceiveMessageCommand } from "@aws-sdk/client-sqs";

import logger from '../init/logger.js';

const REGION = "us-west-2";
const ACCOUNT_ID = "087541088256";
const BASE_URI = `https://sqs.${REGION}.amazonaws.com/${ACCOUNT_ID}`

class SqsClient {
    constructor() {
        this.client = new SQSClient({
            region: REGION,
        });
    }

    endpoint(queueName) {
        return `${BASE_URI}/${queueName}`;
    }

    async readMessageFromQueue(queueName) {
        logger.info("Polling for message...");

        const command = new ReceiveMessageCommand({
            QueueUrl: this.endpoint(queueName),
            AttributeNames: ["All"],
            MaxNumberOfMessages: 1,
        });

        const response = await this.client.send(command);

        if (response.Messages) {
            logger.info("Message read from queue: ", JSON.stringify(response));
            return response;
        } else {
            logger.info("No messages found. ", JSON.stringify(response));
            return {};
        }
    }
}

export default SqsClient;