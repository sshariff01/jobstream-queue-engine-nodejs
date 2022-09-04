import logger from "../init/logger.js";
import Jobstream from "../lib/jobstream.js";

class CustomerRequestAsyncJob extends Jobstream {
    constructor({ workerId } = { workerId: null }) {
        // Automagically determine appropriate queue name by
        //  looking in current dir ./*.config, or allowing for
        //  parameter override

        super({ queueName: 'Jobstream-v0' });
        this.logger = logger.child({ workerId: workerId });
    }

    async process({ message }) {
        this.logger.info('CustomerRequestAsyncJob processing start...')
        this.logger.info(JSON.stringify(message));
        this.logger.info('CustomerRequestAsyncJob processing end.')

        return message;
    }
}

export default CustomerRequestAsyncJob;