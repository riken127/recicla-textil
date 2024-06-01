// Importing nodemailer module
var nodemailer = require("nodemailer");

/**
 * Creates a transporter object that can send mail.
 *
 * This function creates a nodemailer transporter object with the specified
 * service, host, port, security option, and authentication details.
 *
 * @returns {Object} The transporter object.
 */
const createTransporter = () => {
    return nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });
};

/**
 * Creates an email object and a function to send the email.
 *
 * This function creates an email object with the specified recipient, subject,
 * and text. It also creates a send function that sends the email using the
 * previously created transporter object.
 *
 * @param {string} emailTo - The recipient of the email.
 * @param {string} emailSubject - The subject of the email.
 * @param {string} emailText - The text of the email.
 * @returns {Object} An object containing the send function.
 */
const createEmail = (emailTo, emailSubject, emailText) => {
    const email = {
        sucessEmail: () => {
            from: process.env.EMAIL;
            to: emailTo;
            subject: emailSubject;
            text: emailText;
        },
        errorEmail: () => {
            from: process.env.EMAIL;
            to: emailTo;
            subject: emailSubject;
            text: emailText;
        },
    };

    mailOptions = {...emailTo, ...emailSubject, ...emailText};

    const transporter = createTransporter();

    /**
     * Sends the email.
     *
     * This function sends the email using the previously created transporter
     * object and the mail options. If an error occurs, it logs the error message.
     */
    async function send() {
        await transporter.sendMail(mailOptions);
    }

    return {send};
};

module.exports = {
    createEmail: createEmail,
};
