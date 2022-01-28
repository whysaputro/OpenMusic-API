require('dotenv').config();

const Hapi = require('@hapi/hapi');
const albums = require('./api/albums');
const AlbumService = require('./services/postgres/AlbumService');
const AlbumValidator = require('./validator/album');

const init = async () => {
  const albumService = new AlbumService();
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
        service: albumService,
        validator: AlbumValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server started on ${server.info.uri}`);
};

init();
