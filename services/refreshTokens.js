const MongoLib = require('../lib/mongo');

class RefreshTokensService {
    constructor() {
        this.collection = 'ndtl_refresh_tokens';
        this.mongoDB = new MongoLib();
    }

    async createRefreshToken({ refreshToken }) {
        const refreshTokenId = await this.mongoDB.create(this.collection, refreshToken);
        return refreshTokenId;
    }

    async getRefreshToken({ refresh_token }) {
        const [refreshToken] = await this.mongoDB.getAllDatos(this.collection, { refresh_token });
        return refreshToken;
    }
}

module.exports = RefreshTokensService;