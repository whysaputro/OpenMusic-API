const { successResponse } = require('../../utils/responses');

class UsersHandler {
  constructor(services, validator) {
    this._services = services;
    this._validator = validator;

    this.postUserHandler = this.postUserHandler.bind(this);
  }

  async postUserHandler(request, h) {
    this._validator.validateUserPayload(request.payload);
    const { username, password, fullname } = request.payload;

    await this._services.verifyNewUsername(username);
    const userId = await this._services.addUser(username, password, fullname);

    return successResponse(h, {
      responseData: {
        userId,
      },
      responseCode: 201,
    });
  }
}

module.exports = UsersHandler;
