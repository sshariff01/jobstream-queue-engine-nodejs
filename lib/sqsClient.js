// ES6+ example
import {
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
    constructor() {
        this.client = new SQSClient({
            region: REGION,
        });
    }

    endpoint(queueName) {
        return `${BASE_URI}/${queueName}`;
    }

    async writeToQueue(queueName) {
        logger.info("Posting message...");

        const messageBody = JSON.stringify({
            jobId: "unique-job-id",
            operationType: "customer-request",
            endpoints: [
                "directory",
            ],
            payrollProviderId: "gusto",
            applicationName: "Free Samples",
            companyId: "abcdef-123456",
            timestamp: Date.now(),
        });

        const command = new SendMessageCommand({
            QueueUrl: this.endpoint(queueName),
            MessageBody: base64Encode(messageBody),
        });

        const response = await this.client.send(command);

        if (response.$metadata.httpStatusCode !== 200) {
            logger.error("Failed to post message!");
        }

        logger.info("Message posted.");
    }

    async readMessageFromQueue(queueName) {
        const command = new ReceiveMessageCommand({
            QueueUrl: this.endpoint(queueName),
            AttributeNames: ["All"],
            MaxNumberOfMessages: 1,
        });

        const response = await this.client.send(command);

        if (response.Messages) {
            const decodedMessage = base64Decode(response.Messages[0].Body);
            logger.info(`Message read from queue: ${decodedMessage}`);
            return response;
        }

        return {};
    }
}

export default SqsClient;