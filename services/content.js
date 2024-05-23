const MongoLib = require('../lib/mongo');

class ContentService {
  constructor() {
    this.collection = 'ndtl_content';
    this.mongoDB = new MongoLib();
  }

  async getContentss( type) {
    const themes = await this.mongoDB.getAll(this.collection, type);
    return themes || [];
  }
  
  async createContents({ contentDetail }) {
    const {
    name,
    permission,
    image_url,
    type,
    type_detail,
    type_id,
    ndtl_user_id,
      assigned,
      created_by,
      created_at,
      updated_at,
    } = contentDetail;

    const createContentId = await this.mongoDB.create(this.collection, {
      name,
      permission,
      image_url,
      type,
      type_id,
      type_detail,
      ndtl_user_id,
        assigned,
        created_by,
        created_at,
        updated_at,
    });

    return createContentId;
  }

}

module.exports = ContentService;
