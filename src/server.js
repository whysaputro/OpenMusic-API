require('dotenv').config();

const Hapi = require('@hapi/hapi');
const ClientError = require('./exceptions/ClientError');

// ALBUM PLUGIN
const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumPayloadValidator = require('./validator/album');

// SONG PLUGIN
const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongPayloadValidator = require('./validator/song');

// USER PLUGIN
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UserPayloadValidator = require('./validator/user');

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();

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
        service: { albumsService, songsService },
        validator: AlbumPayloadValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongPayloadValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UserPayloadValidator,
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

  console.log(`
  ██████  ██████  ███████ ███    ██     ███    ███ ██    ██ ███████ ██  ██████ 
 ██    ██ ██   ██ ██      ████   ██     ████  ████ ██    ██ ██      ██ ██      
 ██    ██ ██████  █████   ██ ██  ██     ██ ████ ██ ██    ██ ███████ ██ ██      
 ██    ██ ██      ██      ██  ██ ██     ██  ██  ██ ██    ██      ██ ██ ██      
  ██████  ██      ███████ ██   ████     ██      ██  ██████  ███████ ██  ██████ Version 2.0 `);
  console.log(`\n Server started on ${server.info.uri}`);
};

init();
