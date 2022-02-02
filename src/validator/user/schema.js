const Joi = require('joi');

const UserPayloadSchema = Joi.object({
  username: Joi.string().max(50).required(),
  password: Joi.string().max(100).required(),
  fullname: Joi.string().max(50).required(),
});

module.exports = UserPayloadSchema;
