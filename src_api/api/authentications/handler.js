const { successResponse } = require('../../utils/responses');

class AuthenticationsHandler {
  constructor({ usersService, authenticationsService }, validator, tokenManager) {
    this._userService = usersService;
    this._authenticationsService = authenticationsService;
    this._validator = validator;
    this._tokenManager = tokenManager;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
  }

  async postAuthenticationHandler(request, h) {
    const { username, password } = request.payload;

    this._validator.validatePostAuthenticationPayload(request.payload);
    const id = await this._userService.verifyUserCredential(username, password);
    const accessToken = this._tokenManager.generateAccessToken({ id });
    const refreshToken = this._tokenManager.generateRefreshToken({ id });
    await this._authenticationsService.addRefreshToken(refreshToken);

    return successResponse(h, {
      responseData: {
        accessToken,
        refreshToken,
      },
      responseCode: 201,
    });
  }

  async putAuthenticationHandler(request, h) {
    const { refreshToken } = request.payload;

    this._validator.validatePutAuthenticationPayload(request.payload);
    await this._authenticationsService.verifyRefreshToken(refreshToken);
    const { id } = this._tokenManager.verifyRefreshToken(refreshToken);
    const accessToken = this._tokenManager.generateAccessToken({ id });

    return successResponse(h, {
      responseData: {
        accessToken,
      },
    });
  }

  async deleteAuthenticationHandler(request, h) {
    const { refreshToken } = request.payload;

    this._validator.validateDeleteAuthenticationPayload(request.payload);
    await this._authenticationsService.verifyRefreshToken(refreshToken);
    await this._authenticationsService.deleteRefreshToken(refreshToken);

    return successResponse(h, {
      responseMessage: 'Refresh token berhasil di hapus',
    });
  }
}

module.exports = AuthenticationsHandler;
