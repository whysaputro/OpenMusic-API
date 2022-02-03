const Joi = require('joi');

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().max(100).required(),
  year: Joi.number().integer().min(1900).max(2022)
    .required(),
});

const ImageHeaderSchema = Joi.object({
  'content-type': Joi.string()
    .valid(
      'image/apng',
      'image/avif',
      'image/gif',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
    ).required(),
}).unknown();

module.exports = { AlbumPayloadSchema, ImageHeaderSchema };
