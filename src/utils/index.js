/* eslint-disable camelcase */
const mapSongDBToModel = ({
  id, title, year, performer, genre, duration, album_id,
}) => ({
  id, title, year, performer, genre, duration, albumId: album_id,
});

const mapSongsToAlbum = ({ id, name, year }, songs) => ({
  id, name, year, songs,
});

module.exports = { mapSongDBToModel, mapSongsToAlbum };
