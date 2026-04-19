const nodemailer = require("nodemailer");

const mailer = async (email,otp) =>{

const transport = await nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NodeMail_ID,
        pass: process.env.NodeMailPassword,
      },
    });
    await transport.sendMail({
      from: process.env.NodeMail_ID,
      to: email,
      subject: "Welcome to ammar commpany",
      text: `your otp code is ${otp} otp expire in 5 mint plz verify`,
    });
}
module.exports = mailer