class PlaylistsHandler {
  constructor({
    playlistsService, playlistSongsService, songsService, playlistSongAvtivitiesService,
  }, validator) {
    this._playlistsService = playlistsService;
    this._playlistSongsService = playlistSongsService;
    this._songsService = songsService;
    this._playlistSongAvtivitiesService = playlistSongAvtivitiesService;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
    this.getSongsFromPlaylistHandler = this.getSongsFromPlaylistHandler.bind(this);
    this.deleteSongFromPlaylistHandler = this.deleteSongFromPlaylistHandler.bind(this);
    this.getActivitiesOnPlaylist = this.getActivitiesOnPlaylist.bind(this);
  }

  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePlaylistPayload(request.payload);
      const { id: userId } = request.auth.credentials;
      const { name } = request.payload;

      const playlistId = await this._playlistsService.addPlaylist(name, userId);

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
      const { id: userId } = request.auth.credentials;
      const playlists = await this._playlistsService.getPlaylists(userId);

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
  async deletePlaylistByIdHandler(request, _) {
    try {
      const { id: userId } = request.auth.credentials;
      const { id: playlistId } = request.params;

      await this._playlistsService.verifyPlaylistOwner(playlistId, userId);
      await this._playlistsService.deletePlaylistById(playlistId);

      return {
        status: 'success',
        message: 'Playlist berhasil dihapus',
      };
    } catch (error) {
      return error;
    }
  }

  // eslint-disable-next-line no-unused-vars
  async postSongToPlaylistHandler(request, h) {
    try {
      this._validator.validatePlaylistSongPayload(request.payload);

      const { id: userId } = request.auth.credentials;
      const { id: playlistId } = request.params;
      const { songId } = request.payload;

      await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
      await this._songsService.getSongById(songId);
      await this._playlistSongsService.addSongToPlaylist(playlistId, songId);
      await this._playlistSongAvtivitiesService.addActivitiy(playlistId, songId, userId, 'add');

      const response = h.response({
        status: 'success',
        message: 'Lagu berhasil ditambahkan ke dalam playlist',
      });

      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  // eslint-disable-next-line no-unused-vars
  async getSongsFromPlaylistHandler(request, _) {
    try {
      const { id: userId } = request.auth.credentials;
      const { id: playlistId } = request.params;

      await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
      const playlist = await this._playlistsService.getPlaylistById(playlistId);
      playlist.songs = await this._playlistSongsService.getSongsFromPlaylistId(playlistId);

      return {
        status: 'success',
        data: {
          playlist,
        },
      };
    } catch (error) {
      return error;
    }
  }

  // eslint-disable-next-line no-unused-vars
  async deleteSongFromPlaylistHandler(request, _) {
    try {
      this._validator.validatePlaylistSongPayload(request.payload);

      const { id: userId } = request.auth.credentials;
      const { id: playlistId } = request.params;
      const { songId } = request.payload;

      await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
      await this._playlistSongsService.deleteSongFromPlaylist(songId);
      await this._playlistSongAvtivitiesService.addActivitiy(playlistId, songId, userId, 'delete');

      return {
        status: 'success',
        message: 'Berhasil menghapus lagu dari playlist',
      };
    } catch (error) {
      return error;
    }
  }

  // eslint-disable-next-line no-unused-vars
  async getActivitiesOnPlaylist(request, _) {
    try {
      const { id: userId } = request.auth.credentials;
      const { id: playlistId } = request.params;
      await this._playlistsService.verifyPlaylistOwner(playlistId, userId);
      await this._playlistsService.getPlaylistById(playlistId);
      const activities = await this._playlistSongAvtivitiesService.getActivities(playlistId);
      const data = {};
      data.playlistId = playlistId;
      data.activities = activities;

      return {
        status: 'success',
        data,
      };
    } catch (error) {
      return error;
    }
  }
}

module.exports = PlaylistsHandler;
