const createPlaylistActivitiesObject = (playlistId, activities) => {
  const object = {};
  object.playlistId = playlistId;
  object.activities = activities;

  return object;
};

module.exports = createPlaylistActivitiesObject;
