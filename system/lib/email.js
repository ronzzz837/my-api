const nodemailer = require('nodemailer');

const config = require("../../config.js")

class Email {
	email = config.smtp.email;
	password = config.smtp.pass;
	
	htmlNotif = (name, paket) => {
		return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${paket} Expired</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #121212;
            margin: 0;
            padding: 20px;
            color: #fff;
        }

        .container {
            background-color: #333;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
            padding: 20px;
            max-width: 600px;
            margin: 0 auto;
        }

        h2 {
            color: #4caf50;
        }

        p {
            margin-bottom: 16px;
        }

        .footer {
            margin-top: 20px;
            text-align: center;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Notifications API</h2>
        <p>Hallo, ${name}</p>
        <p>Kami ingin memberitahu Anda bahwa langganan API ${paket} Anda telah habis. Silakan melakukan pembayaran untuk melanjutkan layanan ${paket} kami.</p>
        <p>Terimakasih telah berlangganan."</p>
        
        <p>Terima kasih atas dukungan Anda!</p>

        <div class="footer">
            <p>© 2024 Ronzz API.</p>
        </div>
    </div>
</body>
</html>`
	}
	
	send = (email, subject, html) => {
		let transporter = nodemailer.createTransport({
        service: "gmail",
        host: 'smtp.gmail.com',
        port: 465,
        secure: false,
        requireTLS: true,
        auth: {
          user: this.email,
          pass: this.password
        },
        from: email
        });

      let mailOptions = {
        from: '"Ronzz API" <support@ronzzyt.com',
        to: email,
        subject: subject,
        html: html,
        };

      transporter.sendMail(mailOptions, (err) => {
        if (err) { console.log(err); }
      });
	}
	
}

module.exports.email = new Email()