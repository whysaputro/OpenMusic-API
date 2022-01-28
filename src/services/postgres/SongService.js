const Pool = require('pg');

class SongService {
  constructor() {
    this._pool = new Pool();
  }
  
}
