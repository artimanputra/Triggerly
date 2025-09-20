import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transport = nodemailer.createTransport({
  host: process.env.SMTP_ENDPOINT,
  port: Number(process.env.SMTP_PORT),
  secure: false, // Use TLS (STARTTLS)
  auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
  },
});

console.log("SMTP Config:", {
  username: process.env.SMTP_USERNAME,
  password: process.env.SMTP_PASSWORD ? "********" : "MISSING",
  endpoint: process.env.SMTP_ENDPOINT,
  port: process.env.SMTP_PORT,
});

export async function sendEmail(to: string, body: string) {
    await transport.sendMail({
        from: `"Arti Manputra" <${process.env.SMTP_USERNAME}>`,
        to,
        subject: "Hello from Zapier",
        text: body,
    });
}
