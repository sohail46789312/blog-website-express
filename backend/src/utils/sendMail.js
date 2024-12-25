import nodemailer from "nodemailer"

import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
});

async function sendMail(options) {
  const info = await transporter.sendMail({
    from: '"Blog Express" syedsohailshah1947@gmail.com', 
    to: options.email   ,
    subject: options.subject, 
    text: options.message, 
  });
  console.log("Message sent: %s", info.messageId); 
}

export default sendMail
