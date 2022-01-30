require('dotenv').config();

const Hapi = require('@hapi/hapi');
const ClientError = require('./exceptions/ClientError');

const albums = require('./api/albums');
const AlbumService = require('./services/postgres/AlbumService');
const AlbumValidator = require('./validator/album');

const songs = require('./api/songs');
const SongService = require('./services/postgres/SongService');
const SongValidator = require('./validator/song');

const init = async () => {
  const albumService = new AlbumService();
  const songService = new SongService();

  const server = Hapi.server({
    host: process.env.HOST,
    port: process.env.PORT,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: { albumService, songService },
        validator: AlbumValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songService,
        validator: SongValidator,
      },
    },
  ]);

  server.ext({
    type: 'onPreResponse',
    method: (request, h) => {
      // Mendapatkan konteks response dari request
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
        const newResponse = h.response({
          status: 'fail',
          message: 'Terjadi kegagalan pada server',
        });

        console.error(response.stack);
        newResponse.code(500);
        return newResponse;
      }

      // jika bukan ClientError, lanjutkan dengan response sebelumnya (tanpa terintervensi)
      return response.continue || response;
    },
  });

  await server.start();
  console.log(`Server started on ${server.info.uri}`);
};

init();
