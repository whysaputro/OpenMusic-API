const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistSongActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addActivitiy(playlistId, songId, userId, action) {
    const id = `activiy-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES ($1, $2,$3,$4,$5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Gagal mencatat aktifitas');
    }
  }

  async getActivities(playlistId) {
    const query = {
      text: `SELECT u.username, s.title, psa.action, psa.time 
             FROM playlist_song_activities psa 
             INNER JOIN playlists p ON p.id = psa.playlist_id
             INNER JOIN songs s ON s.id = psa.song_id
             INNER JOIN users u ON u.id = psa.user_id
             WHERE psa.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = PlaylistSongActivitiesService;
