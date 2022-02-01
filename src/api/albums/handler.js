const { mapSongsToAlbum } = require('../../utils');

class AlbumsHandler {
  constructor({ albumsService, songsService }, validator) {
    this._albumService = albumsService;
    this._songService = songsService;
    this._validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);

      const { name, year } = request.payload;

      const albumId = await this._albumService.addAlbum(name, year);

      const response = h.response({
        status: 'success',
        data: {
          albumId,
        },
      });

      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  // eslint-disable-next-line no-unused-vars
  async getAlbumByIdHandler(request, _) {
    try {
      const { id: albumId } = request.params;
      const album = await this._albumService.getAlbumById(albumId);
      const songs = await this._songService.getSongByAlbumId(albumId);

      return {
        status: 'success',
        data: {
          album: mapSongsToAlbum(album, songs),
        },
      };
    } catch (error) {
      return error;
    }
  }

  // eslint-disable-next-line no-unused-vars
  async putAlbumByIdHandler(request, _) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const { id: albumId } = request.params;
      const { name, year } = request.payload;
      await this._albumService.editAlbumById(albumId, name, year);

      return {
        status: 'success',
        message: 'Album berhasil diperbarui',
      };
    } catch (error) {
      return error;
    }
  }

  // eslint-disable-next-line no-unused-vars
  async deleteAlbumByIdHandler(request, _) {
    try {
      const { id: albumId } = request.params;
      await this._albumService.deleteAlbumById(albumId);

      return {
        status: 'success',
        message: 'Album berhasil dihapus',
      };
    } catch (error) {
      return error;
    }
  }
}

module.exports = AlbumsHandler;
