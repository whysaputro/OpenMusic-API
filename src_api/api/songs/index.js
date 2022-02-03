const SongsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'API To Do CRUD Songs',
  version: '1.0.0',
  register: async (server, { services, validator }) => {
    const songsHandler = new SongsHandler(services, validator);
    server.route(routes(songsHandler));
  },
};
