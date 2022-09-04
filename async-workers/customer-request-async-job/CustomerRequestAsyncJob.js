import logger from "../../init/logger.js";
import Jobstream from "../../lib/jobstream.js";
import path from 'path';
import url from 'url';

class CustomerRequestAsyncJob extends Jobstream {
    constructor({ workerId, config } = { workerId: null, config }) {
        super({ queueName: config.queue_name });
        const log = (() => {
            if (workerId) {
                return logger.child({ workerId: workerId });
            }
            return logger;
        })();
        this.logger = log;
    }

    async process({ message }) {
        this.logger.info('CustomerRequestAsyncJob processing start...')
        this.logger.info(JSON.stringify(message));
        this.logger.info('CustomerRequestAsyncJob processing end.')

        return message;
    }

    static configFilePath() {
        const __filename = url.fileURLToPath(import.meta.url);
        const currDir = path.dirname(__filename);
        return path.resolve(currDir, './config.yaml');
    }
}

export default CustomerRequestAsyncJob;