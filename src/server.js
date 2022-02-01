require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const ClientError = require('./exceptions/ClientError');

/* ALBUM PLUGIN */
const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumValidator = require('./validator/album');

/* SONG PLUGIN */
const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongValidator = require('./validator/song');

/* USER PLUGIN */
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UserValidator = require('./validator/user');

/* AUTHENTICATION PLUGIN */
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const AuthenticationValidator = require('./validator/authentication');
const TokenManager = require('./tokenize/TokenManager');

/* PLAYLIST PLUGIN */
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlayListSongsService = require('./services/postgres/PlaylistSongsService');
const PlaylistValidator = require('./validator/playlist');

/* COLLABORATION PLUGIN */
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationValidator = require('./validator/collaboration');

const init = async () => {
  /* Inisialisasi service */
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const playlistSongsService = new PlayListSongsService();

  const server = Hapi.server({
    host: process.env.HOST,
    port: 5000,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  /* Register eksternal plugin */
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  /* Authentication JWT strategy */
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

  /* Register custom plugin */
  await server.register([
    {
      plugin: albums,
      options: {
        service: {
          albumsService,
          songsService,
        },
        validator: AlbumValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UserValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        service: {
          usersService,
          authenticationsService,
        },
        validator: AuthenticationValidator,
        tokenManager: TokenManager,
      },
    },
    {
      plugin: playlists,
      options: {
        services: {
          playlistsService,
          playlistSongsService,
          songsService,
        },
        validator: PlaylistValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        services: {
          collaborationsService,
          playlistsService,
          usersService,
        },
        validator: CollaborationValidator,
      },
    },
  ]);

  /* Interverensi response ke client untuk memfilter apabila ada error yang terjadi pada response
  ** dan akan dihandle untuk dikirim informasi response error kepada client */
  server.ext({
    type: 'onPreResponse',
    method: (request, h) => {
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

        /* Jika error terjadi pada JWT / Authentication */
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
