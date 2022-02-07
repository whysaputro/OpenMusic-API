const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class UserAlbumLikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async updateLikeAlbum(userId, albumId) {
    const liked = await this.verifyAlbumIsLikedOrNot(userId, albumId);

    if (liked) {
      await this.removeLikeFromAlbum(userId, albumId);
      return 'Menghapus like pada album';
    }
    await this.addLikeToAlbum(userId, albumId);
    return 'Album berhasil disukai';
  }

  async verifyAlbumIsLikedOrNot(userId, albumId) {
    const query = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 and album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);
    if (result.rowCount) {
      return true;
    }
    return false;
  }

  async addLikeToAlbum(userId, albumId) {
    const id = `like-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Gagal menyukai album');
    }

    await this._cacheService.delete(`album-like:${albumId}`);
    return result.rows[0].id;
  }

  async removeLikeFromAlbum(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus like pada album, id tidak ditemukan');
    }

    await this._cacheService.delete(`album-like:${albumId}`);
  }

  async getAlbumLikesByAlbumId(albumId) {
    try {
      return await this._cacheService.get(`album-like:${albumId}`);
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(id) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);
      await this._cacheService.set(`album-like:${albumId}`, result.rows[0].count, 1800);
      return Number(result.rows[0].count);
    }
  }
}

module.exports = UserAlbumLikesService;
