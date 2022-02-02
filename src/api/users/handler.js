const { successResponse } = require('../../utils/responses');

class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postUserHandler = this.postUserHandler.bind(this);
  }

  async postUserHandler(request, h) {
    this._validator.validateUserPayload(request.payload);
    const { username, password, fullname } = request.payload;

    await this._service.verifyNewUsername(username);
    const userId = await this._service.addUser(username, password, fullname);

    return successResponse(h, {
      responseData: {
        userId,
      },
      responseCode: 201,
    });
  }
}

module.exports = UsersHandler;
