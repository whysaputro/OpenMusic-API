/* eslint-disable camelcase */
const mapSongDBToModel = ({ album_id, ...args }) => ({ ...args, albumId: album_id });
const mapSongsToAlbum = ({ id, name, year }, songs) => ({
  id, name, year, songs,
});

module.exports = { mapSongDBToModel, mapSongsToAlbum };
