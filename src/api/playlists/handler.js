class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistHandler = this.deletePlaylistHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePlaylistPayload(request.payload);
      const { id: credentialId } = request.auth.credentials;
      const { name } = request.payload;

      const playlistId = await this._service.addPlaylist(name, credentialId);

      const response = h.response({
        status: 'success',
        data: {
          playlistId,
        },
      });

      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  // eslint-disable-next-line no-unused-vars
  async getPlaylistsHandler(request, _) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const playlists = await this._service.getPlaylists(credentialId);

      return {
        status: 'success',
        data: {
          playlists,
        },
      };
    } catch (error) {
      return error;
    }
  }

  // eslint-disable-next-line no-unused-vars
  async deletePlaylistHandler(request, _) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const { id: playlistId } = request.params;

      await this._service.verifyPlaylistOwner(playlistId, credentialId);
      await this._service.deletePlaylist(playlistId);

      return {
        status: 'success',
        message: 'Playlist berhasil dihapus',
      };
    } catch (error) {
      return error;
    }
  }
}

module.exports = PlaylistsHandler;
