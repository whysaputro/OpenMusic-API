const ClientError = require('../../exceptions/ClientError');

class ErrorsHandler {
  // eslint-disable-next-line class-methods-use-this
  errorHandler(request, h) {
    /* Mendapatkan konteks response dari request */
    const { response } = request;
    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });

      newResponse.code(response.statusCode);
      return newResponse;
    }

    if (response instanceof Error) {
      const { output } = response;

      /* Jika errors terjadi pada JWT / Authentication */
      if (output.statusCode === 401) {
        const newResponse = h.response({
          status: 'fail',
          message: output.payload.message,
        });

        newResponse.code(401);
        return newResponse;
      }

      /* Server Error */
      const newResponse = h.response({
        status: 'error',
        message: 'Terjadi kegagalan pada server',
      });

      console.error(response.stack);
      newResponse.code(500);
      return newResponse;
    }

    /* Jika bukan ClientError, lanjutkan dengan response sebelumnya (tanpa terintervensi) */
    return response.continue || response;
  }
}

module.exports = ErrorsHandler;
