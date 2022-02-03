const ClientError = require('../../exceptions/ClientError');
const { failResponse, errorResponse } = require('../../utils/responses');

class ErrorsHandler {
  // eslint-disable-next-line class-methods-use-this
  errorHandler(request, h) {
    /* Mendapatkan konteks response dari request */
    const { response } = request;
    if (response instanceof ClientError) {
      return failResponse(h, response);
    }

    if (response instanceof Error) {
      const { statusCode, payload } = response.output;
      switch (statusCode) {
        case 500:
          console.error(response.stack);
          return errorResponse(h);
        default:
          return h.response(payload).code(statusCode);
      }
    }

    /* Jika bukan ClientError, lanjutkan dengan response sebelumnya (tanpa terintervensi) */
    return response.continue || response;
  }
}

module.exports = ErrorsHandler;
