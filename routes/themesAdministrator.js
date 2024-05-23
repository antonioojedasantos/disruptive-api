const express = require('express');
const passport = require('passport');
const ThemesService = require('../services/theme');
const moment = require('moment');

const {
    newThemeSchema,
} = require('../utils/schemas/themeDetails');


const validationHandler = require('../utils/middleware/validationHandler');
const scopesValidationHandler = require('../utils/middleware/scopesValidationHandler');

function themeApi(app) {
  const router = express.Router();
  app.use('/api/themes', router);
  const themeServices = new ThemesService();

  router.post(
    '/new',
    passport.authenticate('jwt.admin', { session: false }),
    scopesValidationHandler(['create:theme']),
    validationHandler(newThemeSchema),
    async function(req, res, next) {
      try {

        const themeDetail = {
            name: req.body.name,
            permission: req.body.permission,
            created_by: req.user._id,
            created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
            updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
            assigned: false,
          };

        await themeServices.createTheme({themeDetail});

        const themes = await themeServices.getThemes();
        const themesSorted = themes.sort((first, second) => {
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
          themes:themesSorted,
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
        const themes = await themeServices.getThemes();
        const themesSorted = themes.sort((first, second) => {
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
          list: themesSorted,
          message: 'themes retrieved',
          status_code: 200
        });
      } catch (err) {
        next(err);
      }
    }
  );



}

module.exports = themeApi;
