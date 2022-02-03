const routes = require('./routes');
const UsersHandler = require('./handler');

module.exports = {
  name: 'API To Do CRUD Users',
  version: '1.0.0',
  register: async (server, { services, validator }) => {
    const usersHandler = new UsersHandler(services, validator);
    server.route(routes(usersHandler));
  },
};
