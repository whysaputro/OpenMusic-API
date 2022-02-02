const { successResponse } = require('../../utils/responses');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const {
      title, year, performer, genre, duration, albumId,
    } = request.payload;

    const songId = await this._service.addSong(title, year, performer, genre, duration, albumId);

    return successResponse(h, {
      responseData: {
        songId,
      },
      responseCode: 201,
    });
  }

  async getSongsHandler(request, h) {
    const { title, performer } = request.query;
    const songs = await this._service.getSongs(title, performer);

    if (title && performer) {
      return successResponse(h, {
        responseData: {
          // eslint-disable-next-line max-len
          songs: songs.filter((el) => el.title.toLowerCase().includes(title) && el.performer.toLowerCase().includes(performer)),
        },
      });
    }

    if (title) {
      return successResponse(h, {
        responseData: {
          songs: songs.filter((el) => el.title.toLowerCase().includes(title)),
        },
      });
    }

    if (performer) {
      return successResponse(h, {
        responseData: {
          songs: songs.filter((el) => el.performer.toLowerCase().includes(performer)),
        },
      });
    }

    return successResponse(h, {
      responseData: {
        songs,
      },
    });
  }

  async getSongByIdHandler(request, h) {
    const { id: songId } = request.params;

    const song = await this._service.getSongById(songId);

    return successResponse(h, {
      responseData: {
        song,
      },
    });
  }

  async putSongByIdHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const { id: songId } = request.params;
    const {
      title, year, performer, genre, duration, albumId,
    } = request.payload;

    await this._service.editSongById(
      songId,
      title,
      year,
      performer,
      genre,
      duration,
      albumId,
    );

    return successResponse(h, {
      responseMessage: 'Lagu berhasil diperbarui',
    });
  }

  async deleteSongByIdHandler(request, h) {
    const { id: songId } = request.params;

    await this._service.deleteSongById(songId);

    return successResponse(h, {
      responseMessage: 'Lagu berhasil dihapus',
    });
  }
}

module.exports = SongsHandler;
