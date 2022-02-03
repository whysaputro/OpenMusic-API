const concatenateSongsToAlbumModel = require('../../utils/model/AlbumModel');
const { successResponse } = require('../../utils/responses');

class AlbumsHandler {
  constructor({
    albumsService, songsService, storageService, userAlbumLikesService,
  }, validator) {
    this._albumService = albumsService;
    this._songService = songsService;
    this._userAlbumLikesService = userAlbumLikesService;
    this._storageService = storageService;
    this._validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    this.postUploadCoverAlbumByIdHandler = this.postUploadCoverAlbumByIdHandler.bind(this);
    this.postLikeToAlbumHandler = this.postLikeToAlbumHandler.bind(this);
    this.getAlbumLikesHandler = this.getAlbumLikesHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    const { name, year } = request.payload;

    this._validator.validateAlbumPayload(request.payload);
    const albumId = await this._albumService.addAlbum(name, year);

    return successResponse(h, {
      responseData: {
        albumId,
      },
      responseCode: 201,
    });
  }

  async getAlbumByIdHandler(request, h) {
    const { id: albumId } = request.params;

    const album = await this._albumService.getAlbumById(albumId);
    const songs = await this._songService.getSongByAlbumId(albumId);

    return successResponse(h, {
      responseData: {
        album: concatenateSongsToAlbumModel(album, songs),
      },
    });
  }

  async putAlbumByIdHandler(request, h) {
    const { id: albumId } = request.params;
    const { name, year } = request.payload;

    this._validator.validateAlbumPayload(request.payload);
    await this._albumService.editAlbumById(albumId, name, year);

    return successResponse(h, {
      responseMessage: 'Album berhasil diperbarui',
    });
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id: albumId } = request.params;

    await this._albumService.deleteAlbumById(albumId);

    return successResponse(h, {
      responseMessage: 'Album berhasil dihapus',
    });
  }

  async postUploadCoverAlbumByIdHandler(request, h) {
    const { id: albumId } = request.params;
    const { cover } = request.payload;

    this._validator.validateImageHeaders(cover.hapi.headers);
    await this._albumService.verifyAlbumIsExist(albumId);
    const filelocation = await this._storageService.writeFile(cover, cover.hapi);
    await this._albumService.addCoverAlbumById(filelocation, albumId);

    return successResponse(h, {
      responseMessage: 'Sampul berhasil diunggah',
      responseCode: 201,
    });
  }

  async postLikeToAlbumHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._albumService.verifyAlbumIsExist(albumId);
    const likeId = await this._userAlbumLikesService.giveLikeToAlbum(userId, albumId);

    return successResponse(h, {
      responseMessage: likeId ? 'Album berhasil disukai' : 'Menghapus like pada album',
      responseCode: 201,
    });
  }

  async getAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;

    const numOfLikes = await this._userAlbumLikesService.getAlbumLikesByAlbumId(albumId);

    return successResponse(h, {
      responseData: {
        likes: numOfLikes,
      },
    });
  }
}

module.exports = AlbumsHandler;
