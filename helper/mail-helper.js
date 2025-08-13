const nodemailer = require("nodemailer");

// Create a single transporter for all emails
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_EMAIL_PASSWORD,
  },
});

// Send password reset email
async function sendMailForResetPassword(id, name, email, token) {
  try {
    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: email,
      subject: `Hi ${name}, Password Reset`,
      html: `
        <h1>Password Reset</h1>
        <p>Please reset your password by clicking the link below:</p>
        <a href="http://localhost:3000/reset_password/${id}/${token}">Reset Your Password</a>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return { status: true, info };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { status: false, error };
  }
}

// Send profile upload notification email
async function sendProfileUploadEmail(toEmail, userName) {
  try {
    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: toEmail,
      subject: "Profile Image Uploaded",
      text: `Hi ${userName}, your profile image has been successfully uploaded.`,
      html: `<p>Hi <b>${userName}</b>, your profile image has been successfully uploaded.</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    return { status: true, info };
  } catch (error) {
    console.error("Error sending profile upload email:", error);
    return { status: false, error };
  }
}

module.exports = {
  sendMailForResetPassword,
  sendProfileUploadEmail,
};
