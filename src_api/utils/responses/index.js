const successResponse = (h, {
  responseMessage, responseData, responseCode = 200,
}) => {
  const response = {
    status: 'success',
  };

  if (responseMessage) {
    response.message = responseMessage;
  }

  if (responseData) {
    response.data = responseData;
  }

  return h.response(response).code(responseCode);
};

const failResponse = (h, error) => h.response({
  status: 'fail',
  message: error.message,
}).code(error.statusCode);

const errorResponse = (h) => h.response({
  status: 'error',
  message: 'Maaf, terjadi kegagalan pada server',
}).code(500);

module.exports = { successResponse, failResponse, errorResponse };
