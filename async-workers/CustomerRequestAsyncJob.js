import logger from "../init/logger.js";
import Jobstream from "../lib/jobstream.js";

class CustomerRequestAsyncJob extends Jobstream {
    constructor() {
        super({ queueName: 'Jobstream-v0' });
    }

    async process({ message }) {
        logger.info('CustomerRequestAsyncJob processing start...')
        logger.info(JSON.stringify(message));
        logger.info('CustomerRequestAsyncJob processing end.')

        return message;
    }
}

export default CustomerRequestAsyncJob;