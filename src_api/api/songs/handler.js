const { successResponse } = require('../../utils/responses');

class SongsHandler {
  constructor(services, validator) {
    this._services = services;
    this._validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler(request, h) {
    const {
      title, year, performer, genre, duration, albumId,
    } = request.payload;

    this._validator.validateSongPayload(request.payload);
    // eslint-disable-next-line max-len
    const songId = await this._services.addSong(title, year, performer, genre, duration, albumId);

    return successResponse(h, {
      responseData: {
        songId,
      },
      responseCode: 201,
    });
  }

  async getSongsHandler(request, h) {
    const { title, performer } = request.query;

    const songs = await this._services.getSongs(title, performer);

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

    const song = await this._services.getSongById(songId);

    return successResponse(h, {
      responseData: {
        song,
      },
    });
  }

  async putSongByIdHandler(request, h) {
    const { id: songId } = request.params;
    const {
      title, year, performer, genre, duration, albumId,
    } = request.payload;

    this._validator.validateSongPayload(request.payload);
    await this._services.editSongById(
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

    await this._services.deleteSongById(songId);

    return successResponse(h, {
      responseMessage: 'Lagu berhasil dihapus',
    });
  }
}

module.exports = SongsHandler;
