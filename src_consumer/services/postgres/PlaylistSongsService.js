const { Pool } = require('pg');

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async getSongsFromPlaylistId(playlistId) {
    const query = {
      text: `SELECT s.id, s.title, s.performer 
             FROM playlist_songs ps
             INNER JOIN songs s ON s.id = ps.song_id
             WHERE ps.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = PlaylistSongsService;
