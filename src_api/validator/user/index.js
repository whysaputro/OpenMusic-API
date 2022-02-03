const UserPayloadSchema = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const UserPayloadValidator = {
  validateUserPayload: (payload) => {
    const validationResult = UserPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UserPayloadValidator;
