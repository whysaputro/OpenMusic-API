class CollaborationsHandler {
  constructor({ collaborationsService, playlistsService, usersService }, validator) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._usersService = usersService;
    this._validator = validator;

    this.postCollaborationHandler = this.postCollaborationHandler.bind(this);
    this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this);
  }

  async postCollaborationHandler(request, h) {
    try {
      this._validator.validateCollaboration(request.payload);

      const { id: credentialId } = request.auth.credentials;
      const { playlistId, userId } = request.payload;

      await this._usersService.getUserByUserId(userId);
      await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
      const collaborationId = await this._collaborationsService.addCollaboration(playlistId, userId);

      const response = h.response({
        status: 'success',
        data: {
          collaborationId,
        },
      });

      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  // eslint-disable-next-line no-unused-vars
  async deleteCollaborationHandler(request, _) {
    try {
      this._validator.validateCollaboration(request.payload);

      const { id: credentialId } = request.auth.credentials;
      const { playlistId, userId } = request.payload;

      await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
      await this._collaborationsService.deleteCollaboration(playlistId, userId);

      return {
        status: 'success',
        message: 'Kolaborasi berhasil dihapus',
      };
    } catch (error) {
      return error;
    }
  }
}

module.exports = CollaborationsHandler;
