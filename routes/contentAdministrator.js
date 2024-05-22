const express = require('express');
const passport = require('passport');
const ContentService = require('../services/content');
const moment = require('moment');
const UsersService = require('../services/users');
const boom = require('@hapi/boom');

const {
  newContentSchema,
} = require('../utils/schemas/themeDetails');


const validationHandler = require('../utils/middleware/validationHandler');
const scopesValidationHandler = require('../utils/middleware/scopesValidationHandler');

function themeApi(app) {
  const router = express.Router();
  app.use('/api/content', router);
  const usersService = new UsersService();
  const contentService = new ContentService();


  router.post(
    '/new',
    passport.authenticate('jwt.admin', { session: false }),
    scopesValidationHandler(['create:content']),
    validationHandler(newContentSchema),
    async function(req, res, next) {
      try {

        const userFound = await usersService.getUserById({userId:req.user._id});
        if(!userFound){
          next(
            boom.badRequest('El usuario ingresado no existe o esta bloqueado')
          );
          return;
        }

        const contentDetail = {
            name: req.body.name,
            permission: req.body.permission,
            image_url: req.body.image_url,
            type:req.body.type,
            type_detail: req.body.type_detail,
            ndtl_user_id: userFound._id,
            created_by: userFound.user_name,
            created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
            updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
            assigned: true,
          };

        await contentService.createContents({contentDetail});
       
        res.status(200).json({
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
    scopesValidationHandler(['read:content']),
    async function(req, res, next) {
      try {
        const contents = await contentService.getContentss();
        const contentSorted = contents.sort((first, second) => {
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
          list: contentSorted,
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
