const ErrorHandler = require('./handler');

module.exports = {
  name: 'Errors Handler',
  version: '1.0.0',
  register: (server) => {
    const errorHandler = new ErrorHandler();

    /* Interverensi response ke client untuk memfilter apabila ada errors yang terjadi pada response
    ** dan akan dihandle untuk dikirim informasi response errors kepada client */
    server.ext('onPreResponse', errorHandler.errorHandler);
  },
};
