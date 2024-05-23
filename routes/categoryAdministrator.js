const express = require('express');
const passport = require('passport');
const CategoryService = require('../services/category');
const moment = require('moment');

const {
  newCategorySchema
} = require('../utils/schemas/themeDetails');


const validationHandler = require('../utils/middleware/validationHandler');
const scopesValidationHandler = require('../utils/middleware/scopesValidationHandler');

function categoryApi(app) {
  const router = express.Router();
  app.use('/api/category', router);
  const categoryServices = new CategoryService();

  router.post(
    '/new',
    passport.authenticate('jwt.admin', { session: false }),
    scopesValidationHandler(['create:category']),
    validationHandler(newCategorySchema),
    async function(req, res, next) {
      try {

        const categoryDetail = {
            name: req.body.name,
            permission: req.body.permission,
            created_by: req.user._id,
            created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
            updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
            assigned: false,
          };

        await categoryServices.createCategory({categoryDetail});

        const categories = await categoryServices.getCategory();
        const categoriesSorted = categories.sort((first, second) => {
          if (first.created_at > second.created_at) {
            return -1;
          }

          if (first.created_at < second.created_at) {
            return 1;
          }
          // a must be equal to b
          return 0;
        });
       
        res.status(200).json({
          categories:categoriesSorted,
          message: 'themes retrieved',
          status_code: 200
        });
      } catch (err) {
        next(err);
      }
    }
  );

  router.get(
    '/get',
    passport.authenticate(['jwt.admin', 'jwt.reader', 'jwt.creator'], { session: false }),
    scopesValidationHandler(['read:theme']),
    async function(req, res, next) {
      try {
        const categories = await categoryServices.getCategory();
        const categoriesSorted = categories.sort((first, second) => {
          if (first.created_at > second.created_at) {
            return -1;
          }

          if (first.created_at < second.created_at) {
            return 1;
          }
          // a must be equal to b
          return 0;
        });
        res.status(200).json({
          list: categoriesSorted,
          message: 'themes retrieved',
          status_code: 200
        });
      } catch (err) {
        next(err);
      }
    }
  );



}

module.exports = categoryApi;
