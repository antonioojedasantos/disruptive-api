const MongoLib = require('../lib/mongo');

class ApiKeysService {
  constructor() {
    this.collection = 'ndtl_user_scopes';
    this.mongoDB = new MongoLib();
  }

  async getApiKey({ token }) {
    const [apiKey] = await this.mongoDB.getAll(this.collection, { token });
    return apiKey;
  }

  async getApiKeyByType({ type }) {
    const [apiKey] = await this.mongoDB.getAll(this.collection, { type });
    return apiKey;
  }

  async getApiKeyById({ apiKeyId }) {
    const apiKey = await this.mongoDB.getId(this.collection, apiKeyId);
    return apiKey || {};
  }

}

module.exports = ApiKeysService;
