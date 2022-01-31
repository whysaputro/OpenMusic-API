const routes = require('./routes');
const AuthenticationsHandler = require('./handler');

module.exports = {
  name: 'authentications',
  version: '1.0.0',
  register: async (server, { service, validator, tokenManager }) => {
    const authenticationsHandler = new AuthenticationsHandler(service, validator, tokenManager);

    server.route(routes(authenticationsHandler));
  },
};
