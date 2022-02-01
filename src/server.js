require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
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

// AUTHENTICATION PLUGIN
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const AuthenticationPayloadValidator = require('./validator/authentication');
const TokenManager = require('./tokenize/TokenManager');

// PLAYLIST PLUGIN
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistPayloadValidator = require('./validator/playlist');

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const playlistsService = new PlaylistsService();

  const server = Hapi.server({
    host: process.env.HOST,
    port: process.env.PORT,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  /* Register plugin eksternal */
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  /* Register plugin internal */
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
    {
      plugin: authentications,
      options: {
        service: { usersService, authenticationsService },
        validator: AuthenticationPayloadValidator,
        tokenManager: TokenManager,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistPayloadValidator,
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
        const { output } = response;

        // Jika error terjadi pada JWT
        if (output.statusCode === 401) {
          const newResponse = h.response({
            status: 'fail',
            message: output.payload.message,
          });

          newResponse.code(401);
          return newResponse;
        }

        // Server Error
        const newResponse = h.response({
          status: 'error',
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
