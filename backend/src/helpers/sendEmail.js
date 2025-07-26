import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import hbs from "nodemailer-express-handlebars";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Now you can use __dirname as needed
console.log(`__dirname: ${__dirname}`);


const sendEmail = async (
    subject,
    send_to,
    send_from,
    template,
    name,
    link) => {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: process.env.EMAIL_HOST,
        port: 587,
        secure: false,
        // requireTLS: true,
        auth: {
            user: process.env.USER_EMAIL, // outlook email
            pass: process.env.EMAIL_PASSWORD, // outlook password
        },
        tls: {
            ciphers: "SSLv3",
        },
    });

    try {
        const html = await ejs.renderFile(__dirname + '../../views/' + template + '.ejs',
            { subject: subject, userName: name, link: link },
            { async: true });
        console.log("HTML Template Rendered Successfully" + html);

        const mailOptions = {
            from: send_from,
            to: send_to,
            subject: subject,
            html,
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
                throw error;
            }
            console.log("Email sent successfully:", info.response);
            return info;
        });
    } catch (error) {
        console.error("Error rendering email template:", error);
        throw error;
    }
};

// export default sendEmail;


// Send email with nodemailer and hbs express-handlebars
const sendEmailHandlebars = async (
    subject,
    send_to,
    send_from,
    reply_to,
    template,
    name,
    link) => {

    const transporter = nodemailer.createTransport({
        service: "Outlook365",
        host: process.env.OUTLOOK_EMAIL_HOST,
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: process.env.OUTLOOK_USER_EMAIL, // outlook email
            pass: process.env.OUTLOOK_EMAIL_PASSWORD, // outlook password
        },
        tls: {
            ciphers: "SSLv3",
        },
    });

    const handlebarsOptions = {
        viewEngine: {
            extName: ".handlebars",
            partialsDir: path.resolve(__dirname, "../views"),
            defaultLayout: false,
        },
        viewPath: path.resolve(__dirname, "../views"),
        extName: ".handlebars",
    };

    transporter.use("compile", hbs(handlebarsOptions));
    const mailOptions = {
        from: send_from,
        to: send_to,
        replyTo: reply_to,
        subject: subject,
        template: template,
        context: {
            name: name,
            link: link,
        },
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.log("Error sending email: ", error);
        throw error;
    }
};

export { sendEmail, sendEmailHandlebars };