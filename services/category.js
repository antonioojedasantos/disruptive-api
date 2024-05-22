const MongoLib = require('../lib/mongo');

class CategoryService {
  constructor() {
    this.collection = 'ndtl_category';
    this.mongoDB = new MongoLib();
  }

  async getCategory() {
    const categories = await this.mongoDB.getAll(this.collection, { });
    return categories || [];
  }

  async createCategory({ categoryDetail }) {
    const {
    name,
    permission,
      assigned,
      created_by,
      created_at,
      updated_at,
    } = categoryDetail;

    const createCategoryeId = await this.mongoDB.create(this.collection, {
    name,
    permission,
      assigned,
      created_by,
      created_at,
      updated_at,
    });

    return createCategoryeId;
  }

}

module.exports = CategoryService;
