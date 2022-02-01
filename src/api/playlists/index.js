const routes = require('./routes');
const PlaylistsHandler = require('./handler');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, { services, validator }) => {
    const playlistsHandler = new PlaylistsHandler(services, validator);

    server.route(routes(playlistsHandler));
  },
};
