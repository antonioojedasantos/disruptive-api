const MongoLib = require('../lib/mongo');

class ThemesService {
  constructor() {
    this.collection = 'ndtl_theme';
    this.mongoDB = new MongoLib();
  }

  async getThemes() {
    const themes = await this.mongoDB.getAll(this.collection, { });
    return themes || [];
  }

  async createTheme({ themeDetail }) {
    const {
    name,
    permission,
      assigned,
      created_by,
      created_at,
      updated_at,
    } = themeDetail;

    const createThemeId = await this.mongoDB.create(this.collection, {
    name,
    permission,
      assigned,
      created_by,
      created_at,
      updated_at,
    });

    return createThemeId;
  }

}

module.exports = ThemesService;
