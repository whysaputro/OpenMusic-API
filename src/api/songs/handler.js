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
    try {
      this._validator.validateSongPayload(request.payload);
      const {
        title, year, performer, genre, duration, albumId,
      } = request.payload;

      const songId = await this._service.addSong({
        title, year, performer, genre, duration, albumId,
      });

      const response = h.response({
        status: 'success',
        data: {
          songId,
        },
      });

      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async getSongsHandler(request) {
    const { title, performer } = request.query;
    const songs = await this._service.getSongs(title, performer);

    if (title && performer) {
      return {
        status: 'success',
        data: {
          // eslint-disable-next-line max-len
          songs: songs.filter((el) => el.title.toLowerCase().includes(title) && el.performer.toLowerCase().includes(performer)),
        },
      };
    }

    if (title) {
      return {
        status: 'success',
        data: {
          songs: songs.filter((el) => el.title.toLowerCase().includes(title)),
        },
      };
    }

    if (performer) {
      return {
        status: 'success',
        data: {
          songs: songs.filter((el) => el.performer.toLowerCase().includes(performer)),
        },
      };
    }

    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler(request) {
    try {
      const { id } = request.params;

      const song = await this._service.getSongById(id);
      return {
        status: 'success',
        data: {
          song,
        },
      };
    } catch (error) {
      return error;
    }
  }

  async putSongByIdHandler(request) {
    try {
      this._validator.validateSongPayload(request.payload);
      const { id } = request.params;
      const {
        title, year, performer, genre, duration, albumId,
      } = request.payload;

      await this._service.editSongById(id, {
        title, year, performer, genre, duration, albumId,
      });

      return {
        status: 'success',
        message: 'Lagu berhasil diperbarui',
      };
    } catch (error) {
      return error;
    }
  }

  async deleteSongByIdHandler(request) {
    try {
      const { id } = request.params;

      await this._service.deleteSongById(id);

      return {
        status: 'success',
        message: 'Lagu berhasil dihapus',
      };
    } catch (error) {
      return error;
    }
  }
}

module.exports = SongsHandler;
