const MongoLib = require('../lib/mongo');

class offerTokenServices {
    constructor() {
        this.collection = 'ndtl_token';
        this.mongoDB = new MongoLib();
    }

    
    async createTokenOffer(token){
        const tokenApp = await this.mongoDB.create(this.collection,token);
        return tokenApp;
       
    }
   

  
}

module.exports = offerTokenServices;