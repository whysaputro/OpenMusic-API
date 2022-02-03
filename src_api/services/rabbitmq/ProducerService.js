const amqp = require('amqplib');

const ProducerService = {
  sendMessage: async (queue, message) => {
    const conn = await amqp.connect(process.env.RABBITMQ_SERVER);
    const channel = await conn.createChannel();

    channel.assertQueue(queue, {
      durable: true,
    });

    await channel.sendToQueue(queue, Buffer.from(message));

    setTimeout(() => {
      conn.close();
    }, 1000);
  },
};

module.exports = ProducerService;
