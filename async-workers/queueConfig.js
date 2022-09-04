import yaml from 'js-yaml';
import fs from 'fs';
class QueueConfig {
  static elements;

  constructor({ configuration }) {
    this.configuration = configuration;
  }

  queueName() {
    return this.configuration.sqs_queue_name;
  }

  awsRegion() {
    return this.configuration.aws_region;
  }

  awsAccountId() {
    return this.configuration.aws_account_id;
  }

  static async initConfig({
    filePath,
    logger
  }) {
    if (this.elements) {
      return new this({ configuration: this.elements});
    }

    try {
      this.elements = await yaml.load(fs.readFileSync(filePath, 'utf8'));

      return new this({ configuration: this.elements });
    } catch (e) {
      logger.error(e);
      throw new Error(`There was a problem loading the queue config file at ${filePath}`);
    }
  };
}

export default QueueConfig;