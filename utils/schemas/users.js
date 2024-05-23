const joi = require('@hapi/joi');

const confirmationTokenSchema = {
  confirmation_token: joi
    .string()
    .min(256)
    .max(256)
    .required()
};

const passwordResetSchema = {
  password_reset_token: joi
    .string()
    .min(256)
    .max(256)
    .required(),
  password: joi
    .string()
    .min(8)
    .required(),
  password_confirmation: joi
    .any()
    .valid(joi.ref('password'))
    .required()
    .options({ language: { any: { allowOnly: 'must match password' } } }),
  customer: joi.boolean().required()
};

const forgotPasswordSchema = {
  email: joi
    .string()
    .email()
    .required(),
  customer: joi.boolean().required()
};

const createUserSchema = {
  user_name: joi
    .string()
    .max(100)
    .required(),
  email: joi
    .string()
    .email()
    .required(),
  type_user: joi
    .string()
    .max(15)
    .required(),
};
const createUserAdminSchema = {
  user_name: joi
    .string()
    .max(100)
    .required(),
  email: joi
    .string()
    .email()
    .required()
};


module.exports = {
  createUserSchema,
  confirmationTokenSchema,
  forgotPasswordSchema,
  passwordResetSchema,
  createUserAdminSchema,
};
