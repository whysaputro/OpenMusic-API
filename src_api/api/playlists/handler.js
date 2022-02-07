const { successResponse } = require('../../utils/responses');
const createPlaylistActivitiesObject = require('../../utils/model/PlaylistModel');

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
    const { id: userId } = request.auth.credentials;
    const { name } = request.payload;

    this._validator.validatePlaylistPayload(request.payload);
    const playlistId = await this._playlistsService.addPlaylist(name, userId);

    return successResponse(h, {
      responseData: {
        playlistId,
      },
      responseCode: 201,
    });
  }

  async getPlaylistsHandler(request, h) {
    const { id: userId } = request.auth.credentials;

    const playlists = await this._playlistsService.getPlaylists(userId);

    return successResponse(h, {
      responseData: {
        playlists,
      },
    });
  }

  async deletePlaylistByIdHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this._playlistsService.verifyPlaylistOwner(playlistId, userId);
    await this._playlistsService.deletePlaylistById(playlistId);

    return successResponse(h, {
      responseMessage: 'Playlist berhasil dihapus',
    });
  }

  async postSongToPlaylistHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    const { songId } = request.payload;

    this._validator.validatePlaylistSongPayload(request.payload);
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
    await this._songsService.verifySongIsExist(songId);
    await this._playlistSongsService.addSongToPlaylist(playlistId, songId);
    await this._playlistSongAvtivitiesService.addActivitiy(playlistId, songId, userId, 'add');

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke dalam playlist',
    });

    response.code(201);
    return response;
  }

  async getSongsFromPlaylistHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
    const playlist = await this._playlistsService.getPlaylistById(playlistId);
    playlist.songs = await this._playlistSongsService.getSongsFromPlaylistId(playlistId);

    return successResponse(h, {
      responseData: {
        playlist,
      },
    });
  }

  async deleteSongFromPlaylistHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    const { songId } = request.payload;

    this._validator.validatePlaylistSongPayload(request.payload);
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
    await this._playlistSongsService.deleteSongFromPlaylist(songId);
    await this._playlistSongAvtivitiesService.addActivitiy(playlistId, songId, userId, 'delete');

    return successResponse(h, {
      responseMessage: 'Berhasil menghapus lagu dari playlist',
    });
  }

  async getActivitiesOnPlaylist(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this._playlistsService.verifyPlaylistOwner(playlistId, userId);
    await this._playlistsService.verifyPlaylistIsExist(playlistId);
    const activities = await this._playlistSongAvtivitiesService.getActivities(playlistId);

    return successResponse(h, {
      responseData: {
        playlistId,
        activities,
      },
    });
  }
}

module.exports = PlaylistsHandler;
