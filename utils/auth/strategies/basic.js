/* eslint-disable no-console */
const passport = require('passport');
const { Strategy, ExtractJwt } = require('passport-jwt');
const { BasicStrategy } = require('passport-http');
const boom = require('@hapi/boom');
const util = require('util');
const UsersService = require('../../../services/users');
const { config } = require('../../../config');

passport.use('basic.owner',
  new BasicStrategy(async function(email, userName, cb) {
    const userService = new UsersService();

    try {

      console.log('Email: '+util.inspect({ email }));
      
      const user = await userService.getUser({ email ,userName });
      
      console.log('User ----> '+util.inspect(user));
      
      if (!user) {
        return cb(boom.unauthorized(), false);
      }


      return cb(null, user);
    } catch (error) {
      return cb(error);
    }
  })
);
passport.use(
  'jwt.admin',
  new Strategy(
    {
      secretOrKey: config.authJwtSecret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    },
    async function(tokenPayload, cb) {
      const usersService = new UsersService();

      try {
        const user = await usersService.getUser({ email: tokenPayload.email });

        if (!user) {
          return cb(boom.unauthorized(), false);
        }

        cb(null, { ...user, scopes: tokenPayload.scopes });
      } catch (error) {
        return cb(error);
      }
    }
  )
);

passport.use(
  'jwt.reader',
  new Strategy(
    {
      secretOrKey: config.authJwtSecret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    },
    async function(tokenPayload, cb) {
      const usersService = new UsersService();

      try {
        const user = await usersService.getUser({ email: tokenPayload.email });

        if (!user) {
          return cb(boom.unauthorized(), false);
        }

        delete user.password;

        cb(null, { ...user, scopes: tokenPayload.scopes });
      } catch (error) {
        return cb(error);
      }
    }
  )
);

passport.use(
  'jwt.creator',
  new Strategy(
    {
      secretOrKey: config.authJwtSecret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    },
    async function(tokenPayload, cb) {
      const usersService = new UsersService();

      try {
        const user = await usersService.getUser({ email: tokenPayload.email });

        if (!user) {
          return cb(boom.unauthorized(), false);
        }

        delete user.password;

        cb(null, { ...user, scopes: tokenPayload.scopes });
      } catch (error) {
        return cb(error);
      }
    }
  )
);