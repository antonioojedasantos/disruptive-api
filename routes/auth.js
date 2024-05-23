const express = require('express');
const passport = require('passport');
const boom = require('@hapi/boom');
const jwt = require('jsonwebtoken');
const ApiKeysService = require('../services/apiKeys');
const UsersService = require('../services/users');
const RefreshTokensService = require('../services/refreshTokens');


const moment = require('moment');
const randtoken = require('rand-token');
const _ = require('lodash');
const bcrypt = require('bcrypt');

const {
  createUserSchema,
  confirmationTokenSchema,
  passwordResetSchema,
  forgotPasswordSchema,
  createProviderUserSchema,
  createUserAdminSchema
} = require('../utils/schemas/users');

const { config } = require('../config');

const validationHandler = require('../utils/middleware/validationHandler');
require('../utils/auth/strategies/basic');

function authApi(app) {
  const router = express.Router();
  app.use('/api/auth', router);

  const apiKeysService = new ApiKeysService();
  const usersService = new UsersService();
  const refreshTokens = new RefreshTokensService();


  router.post('/sign-in', async function(req, res, next) {
    passport.authenticate('basic.owner', function(error, user) {
      try {
        if (error || !user) {
          next(boom.unauthorized());
          return;
        }

        if (user.enabled == false) {
          next(
            boom.badRequest('El usuario ingresado no existe o esta bloqueado')
          );
          return;
        }

        req.login(user, { session: false }, async function(error) {
          if (error) {
            next(error);
          }
          const apiKey = await apiKeysService.getApiKeyById({
            apiKeyId: user.scope_type_id
          });

          if (!apiKey) {
            next(boom.unauthorized());
            return;
          }

          const { _id: id, user_name, email, confirmed, type_user } = user;

          const payload = {
            sub: id,
            user_name,
            email,
            scopes: apiKey.scopes
          };

          const token = jwt.sign(payload, config.authJwtSecret, {
            expiresIn: '15m'
          });

          const newRefreshToken = randtoken.uid(256);

          const refreshToken = {
            ndtl_user_id: id,
            refresh_token: newRefreshToken,
            created_at: moment().format('YYYY-MM-DD HH:mm:ss')
          };

          await refreshTokens.createRefreshToken({ refreshToken });

          var userAuthenticated = {
            status_code: 200,
            token,
            refresh_token: newRefreshToken,
            user: { id, user_name, email, confirmed, type_user }
          };
          return res.status(200).json(userAuthenticated);
        });
      } catch (error) {
        next(error);
      }
    })(req, res, next);
  });

  router.post('/token', async function(req, res, next) {
    const { refresh_token } = req.body;
    try {
      if (!refresh_token) {
        next(boom.unauthorized('refresh_token is required'));
        return;
      }

      const refreshToken = await refreshTokens.getRefreshToken({
        refresh_token
      });

      if (!refreshToken) {
        next(boom.unauthorized('this token is not valid'));
        return;
      }

      const userId = refreshToken.ndtl_user_id;

      const user = await usersService.getUserById({ userId: userId });

      if (_.isEmpty(user)) {
        next(boom.unauthorized('this user is not valid'));
        return;
      }

      const apiKey = await apiKeysService.getApiKeyById({
        apiKeyId: user.scope_type_id
      });

      if (!apiKey) {
        next(boom.unauthorized('this user has not valid scope'));
      }

      const { _id: id, name, email, confirmed, type_user } = user;

      const payload = {
        sub: id,
        name,
        email,
        scopes: apiKey.scopes
      };

      const token = jwt.sign(payload, config.authJwtSecret, {
        expiresIn: '15m'
      });

      var userAuthenticated = {
        token,
        user: { id, name, email, confirmed, type_user }
      };

      if (apiKey.type == 'root') {
        userAuthenticated.subsidiary_type_for_loading = 'none';
        userAuthenticated.subsidiary_id = '';
        userAuthenticated.commerce_id = '';
        userAuthenticated.apply_modules = '';
      }

      if (apiKey.type == 'owner') {
        userAuthenticated.subsidiary_type_for_loading = 'none';
        userAuthenticated.subsidiary_id = '';
      }

      if (apiKey.type == 'employee') {
       

        const subsidiaryId = '';
        userAuthenticated.subsidiary_id = subsidiaryId;
        userAuthenticated.commerce_id = '';
      }

      if (apiKey.type == 'user') {
        userAuthenticated.subsidiary_type_for_loading = null;
        userAuthenticated.subsidiary_id = null;
        userAuthenticated.commerce_id = '';
      }
      if (apiKey.type == 'sell') {
        userAuthenticated.subsidiary_type_for_loading = 'none';
        userAuthenticated.subsidiary_id = '';
        userAuthenticated.commerce_id = '';
      }

      return res.status(200).json(userAuthenticated);
    } catch (error) {
      next(error);
    }
  });

  router.post(
    '/sign-up',
    validationHandler(createUserSchema),
    async function(req, res, next) {
      const { body: user } = req;
      try {
      const userFound = await usersService.getUser({ email: user.email });

      if (userFound) {
        next(boom.badRequest('El nombre de usuario/correo que intentas usar no esta disponible'));
        return;
      }
      const userFound2 = await usersService.getUser({ user_name: user.user_name });
      if (userFound2) {
        next(boom.badRequest('El nombre de usuario/correo que intentas usar no esta disponible'));
        return;
      }
      const apiKey = await apiKeysService.getApiKeyByType({ type: user.type_user });
      const confirmationToken = randtoken.uid(256);

      user.confirmed = true;
      user.enabled = true;
      user.created_by = 'Aplicacion web';
      user.confirmation_token = confirmationToken;
      user.created_at = moment().format('YYYY-MM-DD HH:mm:ss');
      user.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
      user.scope_type_id = apiKey._id;
      user.assigned = false;

      const createdUserId = await usersService.createUser({ user });


      const apiKeyToken = await apiKeysService.getApiKeyById({
        apiKeyId: user.scope_type_id
      });

      if (!apiKeyToken) {
        next(boom.unauthorized());
        return;
      }
      
      const {  user_name, email } = user;

          const payload = {
            sub: createdUserId,
            user_name,
            email,
            scopes: apiKeyToken.scopes
          };

          const token = jwt.sign(payload, config.authJwtSecret, {
            expiresIn: '15m'
          });
        res.status(200).json({
          _id: createdUserId,
          token,
          confirmation_token: confirmationToken,
          user: user,
          message: 'user created',
          status_code: 200
        });
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    '/security/admin/sign-up',
    validationHandler(createUserAdminSchema),
    async function(req, res, next) {
      const { body: user } = req;
      try {
        const userFound = await usersService.getUser({ email: user.email });
  
        if (userFound) {
          next(boom.badRequest('El nombre de usuario/correo que intentas usar no esta disponible'));
          return;
        }
        const userFound2 = await usersService.getUser({ user_name: user.user_name });
        if (userFound2) {
          next(boom.badRequest('El nombre de usuario/correo que intentas usar no esta disponible'));
          return;
        }
        const apiKey = await apiKeysService.getApiKeyByType({ type: 'admin' });
        const confirmationToken = randtoken.uid(256);
  
        user.confirmed = true;
        user.enabled = true;
        user.created_by = 'Aplicacion web';
        user.confirmation_token = confirmationToken;
        user.created_at = moment().format('YYYY-MM-DD HH:mm:ss');
        user.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
        user.scope_type_id = apiKey._id;
        user.assigned = false;
        user.type_user = 'admin'
  
        const createdUserId = await usersService.createUser({ user });
  
  
        const apiKeyToken = await apiKeysService.getApiKeyById({
          apiKeyId: user.scope_type_id
        });
  
        if (!apiKeyToken) {
          next(boom.unauthorized());
          return;
        }
        
        const {  user_name, email } = user;
  
            const payload = {
              sub: createdUserId,
              user_name,
              email,
              scopes: apiKeyToken.scopes
            };
  
            const token = jwt.sign(payload, config.authJwtSecret, {
              expiresIn: '15m'
            });
          res.status(200).json({
            _id: createdUserId,
            token,
            confirmation_token: confirmationToken,
            user: user,
            message: 'user created',
            status_code: 200
          });
        } catch (error) {
          next(error);
        }
    }
  );

  router.post(
    '/account/confirm',
    validationHandler(confirmationTokenSchema),
    async function(req, res, next) {
      const { confirmation_token } = req.body;

      const userFound = await usersService.getUserByConfirmationToken({
        confirmation_token
      });

      if (!userFound) {
        next(boom.badRequest('No fue posible procesar la petición'));
        return;
      }
      if (userFound.confirmed == true) {
        res.status(200).json({
          message: 'Tu cuenta ya fue confirmada con éxito.'
        });
      }
      try {
        userFound.confirmation_token = null;
        userFound.confirmed = true;
        userFound.confirmed_at = moment().format('YYYY-MM-DD HH:mm:ss');

        const userConfirmedId = await usersService.confirmUserAccount({
          userId: userFound._id,
          user: userFound
        });

        const userUpdated = await usersService.getUserById({
          userId: userConfirmedId
        });

        delete userUpdated.password;

        res.status(200).json({
          user: userUpdated,
          message:
            'Tu cuenta fue confirmada con éxito, ahora inicia sesión para continuar.'
        });
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    '/account/confirm/resend',
    async function(req, res, next) {
      const userFound = await usersService.getUserById({
        userId: req.user._id
      });

      if (userFound.confirmed_at != null) {
        next(boom.badRequest('No fue posible procesar la petición'));
        return;
      }

      try {
        const confirmationToken = randtoken.uid(256);
        userFound.confirmation_token = confirmationToken;

        const userConfirmedId = await usersService.updateUserInformation({
          userId: userFound._id,
          user: userFound
        });

        res.status(200).json({
          _id: userConfirmedId,
          confirmation_token: confirmationToken,
          message: 'user confirmed'
        });
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    '/account/password/forgot',
    validationHandler(forgotPasswordSchema),
    async function(req, res, next) {
      const { body: passwordForgot } = req;

      var userFound = null;
      var userFoundCustomer = null;

      userFound = await usersService.getUser({ email: passwordForgot.email });

      if (userFound == null && userFoundCustomer == null) {
        next(boom.notFound('El usuario no existe'));
        return;
      }

      try {
        const passwordToken = randtoken.uid(256);
        //userFound.password_reset_token = passwordToken;

        var userConfirmedId = null;

        if (userFoundCustomer != null) {
          userFoundCustomer.password_reset_token = passwordToken;
         
        }
        if (userFound != null) {
          userFound.password_reset_token = passwordToken;
          userConfirmedId = await usersService.updateUserInformation({
            userId: userFound._id,
            user: userFound
          });
        }

        res.status(200).json({
          _id: userConfirmedId,
          password_reset_token: passwordToken,
          message: 'reset password token has been generated successfully'
        });
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    '/account/password/reset',
    validationHandler(passwordResetSchema),
    async function(req, res, next) {
      const { body: newPassword } = req;

      var userFoundCustomer = null;
      var userFound = null;

      userFound = await usersService.getUserByPasswordResetToken({
        password_reset_token: newPassword.password_reset_token
      });

      if (userFound == null && userFoundCustomer == null) {
        next(boom.badRequest('No fue posible procesar la petición'));
        return;
      }

      try {
        const hashedPassword = await bcrypt.hash(newPassword.password, 10);

        var userUpdatedId = null;

        if (userFoundCustomer != null) {
          userFoundCustomer.password_reset_token = null;
          userFoundCustomer.password = hashedPassword;

        }
        if (userFound != null) {
          userFound.password_reset_token = null;
          userFound.password = hashedPassword;

          userUpdatedId = await usersService.updateUserInformation({
            userId: userFound._id,
            user: userFound
          });
        }

        res.status(200).json({
          _id: userUpdatedId,
          message: 'password has been reseted'
        });
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    '/sign-provider',
    validationHandler(createProviderUserSchema),
    async function(req, res, next) {
      const { body } = req;

      const { apiKeyToken, ...user } = body;

      if (!apiKeyToken) {
        next(boom.unauthorized('apiKeyToken is required'));
      }

      try {
        const queriedUser = await usersService.getOrCreateUser({ user });
        const apiKey = await apiKeysService.getApiKey({ token: apiKeyToken });

        if (!apiKey) {
          next(boom.unauthorized());
        }

        const { _id: id, name, email } = queriedUser;

        const payload = {
          sub: id,
          name,
          email,
          scopes: apiKey.scopes
        };

        const token = jwt.sign(payload, config.authJwtSecret, {
          expiresIn: '15m'
        });

        return res.status(200).json({ token, user: { id, name, email } });
      } catch (error) {
        next(error);
      }
    }
  );
}

module.exports = authApi;
