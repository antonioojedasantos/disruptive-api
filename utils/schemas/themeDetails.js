const joi = require('@hapi/joi');

const newThemeSchema = {
    name: joi.string().max(400).required(),
    permission: joi.string().max(255).required(),
}

const newCategorySchema = {
    name: joi.string().max(400).required(),
    permission: joi.string().max(255).required(),
}
const newContentSchema = {
    name: joi.string().max(400).required(),
    type: joi.string().max(255).required(),
    type_detail: joi.string().max(255).required(),
    permission :  joi.string().max(255).required(),
    image_url: joi.string().max(255).required(),
    ndtl_user_id: joi.string().max(255).required(),
}

module.exports = {
    newThemeSchema,
    newCategorySchema,
    newContentSchema,
}