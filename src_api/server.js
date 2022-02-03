require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

/* ERROR HANDLER */
const errors = require('./api/errors');

/* ALBUMS */
const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumValidator = require('./validator/album');

/* SONGS */
const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongValidator = require('./validator/song');

/* USERS */
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UserValidator = require('./validator/user');

/* AUTHENTICATIONS */
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const AuthenticationValidator = require('./validator/authentication');
const TokenManager = require('./tokenize/TokenManager');

/* PLAYLISTS */
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistSongsService = require('./services/postgres/PlaylistSongsService');
const PlaylistSongAvtivitiesService = require('./services/postgres/PlaylistSongActivitiesService');
const PlaylistValidator = require('./validator/playlist');

/* COLLABORATIONS */
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationValidator = require('./validator/collaboration');

/* EXPORT */
const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportValidator = require('./validator/export');

const init = async () => {
  /* Inisialisasi service */
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const playlistSongsService = new PlaylistSongsService();
  const playlistSongAvtivitiesService = new PlaylistSongAvtivitiesService();

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

  /* Register plugin custom */
  await server.register([
    {
      plugin: errors,
    },
    {
      plugin: albums,
      options: {
        services: {
          albumsService,
          songsService,
        },
        validator: AlbumValidator,
      },
    },
    {
      plugin: songs,
      options: {
        services: songsService,
        validator: SongValidator,
      },
    },
    {
      plugin: users,
      options: {
        services: usersService,
        validator: UserValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        services: {
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
          playlistSongAvtivitiesService,
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
    {
      plugin: _exports,
      options: {
        services: {
          ProducerService,
          playlistsService,
        },
        validator: ExportValidator,
      },
    },
  ]);

  await server.start();

  console.log(`
  ██████  ██████  ███████ ███    ██     ███    ███ ██    ██ ███████ ██  ██████ 
 ██    ██ ██   ██ ██      ████   ██     ████  ████ ██    ██ ██      ██ ██      
 ██    ██ ██████  █████   ██ ██  ██     ██ ████ ██ ██    ██ ███████ ██ ██      
 ██    ██ ██      ██      ██  ██ ██     ██  ██  ██ ██    ██      ██ ██ ██      
  ██████  ██      ███████ ██   ████     ██      ██  ██████  ███████ ██  ██████ Version 3.0 `);
  console.log(`\n Server started on ${server.info.uri}`);
};

init();
