require('dotenv').config();

const amqp = require('amqplib');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistSongsService = require('./services/postgres/PlaylistSongsService');
const MailSender = require('./services/mail_sender/MailSender');
const Listener = require('./services/listener/listener');

const init = async () => {
  const playlistsService = new PlaylistsService();
  const playlistSongsService = new PlaylistSongsService();
  const mailSender = new MailSender();
  const listener = new Listener(playlistsService, playlistSongsService, mailSender);

  const conn = await amqp.connect(process.env.RABBITMQ_SERVER);
  const channel = await conn.createChannel();

  channel.assertQueue('export:playlist', {
    durable: true,
  });

  channel.consume('export:playlist', listener.listen, { noAck: true });
  console.log(`Open Music Consumer listen at ${process.env.RABBITMQ_SERVER}`);
};

init();
