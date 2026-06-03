import nodemailer from 'nodemailer';

// @@ Templates (CJS modules)
const resetTemplate = require('../Worker/lssb_mail_temp');
const adminWelcomeTemplate = require('../Worker/lssb_admin_welcome_mail_temp');
const userAccountTemplate = require('../Worker/user_account_mail_temp');

const transporter = nodemailer.createTransport({
    host: 'premium70.web-hosting.com',
    port: 465,
    secure: true,
    auth: {
        user: 'info@lagosscholarship.org',
        pass: 'B0ardm@ster2023'
    }
});

const FROM = '"LSSB" <info@lagosscholarship.org>';

export const sendPasswordResetMail = async (data) => {
    try {
        const info = await transporter.sendMail({
            from: FROM,
            to: data.email,
            subject: 'Password Reset Request',
            html: resetTemplate(data)
        });
        console.log('sendPasswordResetMail OK -->', info.response);
        return true;
    } catch (err) {
        console.log('sendPasswordResetMail ERROR -->', err.message);
        return false;
    }
};

export const sendAdminWelcomeMail = async (data) => {
    try {
        const info = await transporter.sendMail({
            from: FROM,
            to: data.email,
            subject: 'Staff Account Creation',
            html: adminWelcomeTemplate(data)
        });
        console.log('sendAdminWelcomeMail OK -->', info.response);
        return true;
    } catch (err) {
        console.log('sendAdminWelcomeMail ERROR -->', err.message);
        return false;
    }
};

export const sendUserAccountMail = async (data) => {
    try {
        const info = await transporter.sendMail({
            from: FROM,
            to: data.email,
            subject: 'Account Activation',
            html: userAccountTemplate(data)
        });
        console.log('sendUserAccountMail OK -->', info.response);
        return true;
    } catch (err) {
        console.log('sendUserAccountMail ERROR -->', err.message);
        return false;
    }
};
