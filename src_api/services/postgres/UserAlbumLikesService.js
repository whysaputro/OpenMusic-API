const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class UserAlbumLikesService {
  constructor() {
    this._pool = new Pool();
  }

  async giveLikeToAlbum(userId, albumId) {
    const likeId = await this.verifyAlbumIsLikedOrNot(userId, albumId);

    if (likeId) {
      return this.removeLikeFromAlbum(likeId);
    }
    return this.addLikeToAlbum(userId, albumId);
  }

  async verifyAlbumIsLikedOrNot(userId, albumId) {
    const query = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 and album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);
    if (result.rowCount) {
      return result.rows[0].id;
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

    return result.rows[0].id;
  }

  async removeLikeFromAlbum(likeId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE id = $1 RETURNING id',
      values: [likeId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus like pada album, id tidak ditemukan');
    }
  }

  async getAlbumLikesByAlbumId(albumId) {
    const query = {
      text: 'SELECT COUNT(id) FROM user_album_likes WHERE album_id = $1',
      values: [albumId],
    };

    const result = await this._pool.query(query);
    return Number(result.rows[0].count);
  }
}

module.exports = UserAlbumLikesService;
