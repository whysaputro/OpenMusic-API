const routes = require('./routes');
const ExportHandler = require('./handler');

module.exports = {
  name: 'API For Export Playlist',
  version: '1.0.0',
  register: async (server, { services, validator }) => {
    const exportHandler = new ExportHandler(services, validator);
    server.route(routes(exportHandler));
  },
};
