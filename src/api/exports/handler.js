const { successResponse } = require('../../utils/responses/index');

class ExportHandler {
  constructor({ ProducerService, playlistsService }, validator) {
    this._producerService = ProducerService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    this.postExportPlaylistByIdHandler = this.postExportPlaylistByIdHandler.bind(this);
  }

  async postExportPlaylistByIdHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { playlistId } = request.params;
    const { targetEmail } = request.payload;

    this._validator.validateExportPayload(request.payload);
    await this._playlistsService.verifyPlaylistOwner(playlistId, userId);

    const message = {
      playlistId,
      targetEmail,
    };

    await this._producerService.sendMessage('export:playlist', JSON.stringify(message));

    return successResponse(h, {
      responseMessage: 'Permintaan anda sedang kami proses',
      responseCode: 201,
    });
  }
}

module.exports = ExportHandler;
