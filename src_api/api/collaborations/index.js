const CollaborationsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'API To Do CRUD Collaborations',
  version: '1.0.0',
  register: async (server, { services, validator }) => {
    const collaborationsHandler = new CollaborationsHandler(services, validator);

    server.route(routes(collaborationsHandler));
  },
};
