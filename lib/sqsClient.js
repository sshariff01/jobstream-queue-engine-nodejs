// ES6+ example
import {
    DeleteMessageCommand,
    ReceiveMessageCommand,
    SendMessageCommand,
    SQSClient,
} from "@aws-sdk/client-sqs";

import logger from '../init/logger.js';
import { base64Decode, base64Encode } from "./encoding.js";

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

    endpoint(queueName) {
        return `${BASE_URI}/${this.queueName}`;
    }

    async writeToQueue({ messageAttributes }) {
        logger.info("Posting message...");

        const messageBody = JSON.stringify({
            jobId: messageAttributes.jobId,
            operationType: messageAttributes.operationType,
            endpoints: messageAttributes.endpoints,
            payrollProviderId: messageAttributes.payrollProviderId,
            applicationName: messageAttributes.applicationName,
            companyId: messageAttributes.companyId,
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

    async readMessageFromQueue() {
        const command = new ReceiveMessageCommand({
            QueueUrl: this.endpoint(this.queueName),
            AttributeNames: ["All"],
            MaxNumberOfMessages: 1,
        });

        const response = await this.client.send(command);

        if (response.Messages) {
            const receivedMessage = response.Messages[0];
            const decodedMessage = base64Decode(receivedMessage.Body);
            logger.info(`Message read from queue: ${decodedMessage}`);

            await this.deleteMessageFromQueue(receivedMessage);

            return response;
        }

        return {};
    }

    async deleteMessageFromQueue(message) {
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