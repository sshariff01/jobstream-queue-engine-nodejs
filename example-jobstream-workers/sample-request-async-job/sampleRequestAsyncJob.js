import Jobstream from "../../lib/jobstream.js";
import path from 'path';
import url from 'url';

class SampleRequestAsyncJob extends Jobstream {
    static configFilePath() {
        const __filename = url.fileURLToPath(import.meta.url);
        const currDir = path.dirname(__filename);
        return path.resolve(currDir, './config.yaml');
    }

    async perform({ message }) {
        this.logger.info('CustomerRequestAsyncJob processing start...')
        this.logger.info(JSON.stringify(message));
        this.logger.info('CustomerRequestAsyncJob processing end.')

        return message;
    }
}

export default SampleRequestAsyncJob;