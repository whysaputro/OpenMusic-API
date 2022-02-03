const AlbumPayloadSchema = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const AlbumPayloadValidator = {
  validateAlbumPayload: (payload) => {
    const validationResult = AlbumPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AlbumPayloadValidator;
