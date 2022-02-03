const CollaborationPayloadSchema = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const CollaborationPayloadValidator = {
  validateCollaboration: (payload) => {
    const validationResult = CollaborationPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = CollaborationPayloadValidator;
