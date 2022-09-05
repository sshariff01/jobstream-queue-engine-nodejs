import {
    DeleteMessageCommand,
    ReceiveMessageCommand,
    SendMessageCommand,
    SQSClient,
} from "@aws-sdk/client-sqs";

import logger from '../init/logger.js';
import { base64Encode } from "./encoding.js";

class SqsClient {
    constructor({ queueName, awsRegion, awsAccountId }) {
        this.endpoint =
            `https://sqs.${awsRegion}.amazonaws.com/${awsAccountId}/${queueName}`;
        this.client = new SQSClient({
            region: awsRegion,
        });
    }

    async writeToQueue({ message }) {
        logger.info("Posting message...");

        const messageBody = JSON.stringify({
            ...message,
            timestamp: Date.now(),
        });

        const command = new SendMessageCommand({
            QueueUrl: this.endpoint,
            MessageBody: base64Encode(messageBody),
        });

        const response = await this.client.send(command);

        if (response.$metadata.httpStatusCode !== 200) {
            logger.error("Failed to post message!");
        }

        logger.info("Message posted.");
    }

    async readFromQueue() {
        const command = new ReceiveMessageCommand({
            QueueUrl: this.endpoint,
            AttributeNames: ["All"],
            MaxNumberOfMessages: 1,
        });

        const response = await this.client.send(command);

        return response.Messages ? response.Messages[0] : null;
    }

    async deleteFromQueue({ message }) {
        const command = new DeleteMessageCommand({
            QueueUrl: this.endpoint,
            ReceiptHandle: message.ReceiptHandle,
        });

        const response = await this.client.send(command);

        if (response.$metadata.httpStatusCode !== 200) {
            logger.error("Failed to mark message as processed :|");
        }

        logger.info("Message processed.");
    }
}

export default SqsClient;