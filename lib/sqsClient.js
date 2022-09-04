import {
    DeleteMessageCommand,
    ReceiveMessageCommand,
    SendMessageCommand,
    SQSClient,
} from "@aws-sdk/client-sqs";

import logger from '../init/logger.js';
import { base64Encode } from "./encoding.js";

const REGION = "us-west-2";
const ACCOUNT_ID = "087541088256";
const BASE_URI = `https://sqs.${REGION}.amazonaws.com/${ACCOUNT_ID}`

class SqsClient {
    constructor({ queueName }) {
        this.queueName = queueName;
        this.client = new SQSClient({
            region: REGION,
        });
    }

    endpoint() {
        return `${BASE_URI}/${this.queueName}`;
    }

    async writeToQueue({ message }) {
        logger.info("Posting message...");

        const messageBody = JSON.stringify({
            jobId: message.jobId,
            operationType: message.operationType,
            endpoints: message.endpoints,
            payrollProviderId: message.payrollProviderId,
            applicationName: message.applicationName,
            companyId: message.companyId,
            timestamp: Date.now(),
        });

        const command = new SendMessageCommand({
            QueueUrl: this.endpoint(this.queueName),
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
            QueueUrl: this.endpoint(this.queueName),
            AttributeNames: ["All"],
            MaxNumberOfMessages: 1,
        });

        const response = await this.client.send(command);

        if (response.Messages) {
            return response.Messages[0];
        }

        return null;
    }

    async deleteFromQueue({ message }) {
        const command = new DeleteMessageCommand({
            QueueUrl: this.endpoint(this.queueName),
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