const Joi = require('joi');

const SongPayloadSchema = Joi.object({
  title: Joi.string().max(100).required(),
  year: Joi.number().integer().min(1900).max(2022)
    .required(),
  genre: Joi.string().max(100).required(),
  performer: Joi.string().max(100).required(),
  duration: Joi.number().integer(),
  albumId: Joi.string().max(50),
});

module.exports = SongPayloadSchema;
