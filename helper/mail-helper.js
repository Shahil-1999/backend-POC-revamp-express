const nodemailer = require("nodemailer");
async function sendMail(id, name, email, token) {
  try {
    const mailTransporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: email,
      subject: `Hi ${name} Password Reset`,
      html: `<h1> Password Reset: </h1> <span> please reset your password <a href= "http://localhost:3000/reset_password/${id}/${token}"> Reset Your Passsword </a>`,
    };
    mailTransporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log("Error", err);
      } else {
        console.log(`Mail has been sent ${info.response}`);
      }
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      msg: error,
    });
  }
}

module.exports = {
  sendMail,
};
