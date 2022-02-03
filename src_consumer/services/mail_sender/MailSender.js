const nodeMailer = require('nodemailer');

class MailSender {
  constructor() {
    this._transporter = nodeMailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: true,
      auth: {
        user: process.env.MAIL_ADDRESS,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  sendEmail(playlistName, targetEmail, content) {
    const message = {
      from: 'Open Music Apps',
      to: targetEmail,
      subject: `Ekspor daftar lagu pada playlist "${playlistName}"`,
      text: 'Berikut daftar lagu-lagu kamu pada file di lampiran email ini',
      attachments: [
        {
          filename: 'daftar-lagu.json',
          content,
        },
      ],
    };

    return this._transporter.sendMail(message);
  }
}

module.exports = MailSender;
