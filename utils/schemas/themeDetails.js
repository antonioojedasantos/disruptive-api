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
    categoryOrTheme: joi.string().max(255).required(),
    selectedCategory: joi.string().max(255).allow(''),
    selectedTheme: joi.string().max(255).allow(''),
    imageUrl: joi.string().max(755).required(),
}

module.exports = {
    newThemeSchema,
    newCategorySchema,
    newContentSchema,
}