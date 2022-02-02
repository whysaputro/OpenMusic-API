/* eslint-disable camelcase */
const mapDBToModelForSingleSong = ({ album_id, ...dbObject }) => {
  const model = { ...dbObject, albumId: album_id };
  delete model.created_at;
  delete model.updated_at;

  return model;
};

module.exports = mapDBToModelForSingleSong;
