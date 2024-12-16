import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: "syedsohailshah1947@gmail.com",
    pass: "dfwc zspm lmkb aewp",
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