import yaml from 'js-yaml';
import fs from 'fs';
class ConfigResolver {
  static elements;

  static async config({
    filePath,
    logger
  }) {
    if (this.elements) {
      return this.elements;
    }

    try {
      this.elements = await yaml.load(fs.readFileSync(filePath, 'utf8'));

      return this.elements;
    } catch (e) {
      logger.error(e);
      return {};
    }
  };
}

export default ConfigResolver;