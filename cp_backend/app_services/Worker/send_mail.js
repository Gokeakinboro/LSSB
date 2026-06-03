var nodemailer = require('nodemailer');

let html_template = require('./lssb_mail_temp');

// @@ Send mail function   
export const lagMailer = {}


let transporter = nodemailer.createTransport({

    

    // host: 'premium70.web-hosting.com',
    // port: 465,

    host: 'smtp.mailersend.net',
    port: 587,

    secureConnection: true,
    auth: {
        // user: 'info@lagosscholarship.org',
        // pass: 'B0ardm@ster2023',

        user: 'MS_NZDTZ7@test-69oxl5ezezrl785k.mlsender.net',
        pass: 'mssp.FB3IlJm.yzkq340r6k34d796.Qwe7Jgr'

    }
});

lagMailer.sendMail = () => {


    let mailConstData = {
        name: 'LSSB',
        email: 'info@lagosscholarship.org',
        subject: 'Password Reset Request',
        // destinationEmail: 'victorodairo@gmail.com',

    };


    process.on('message', async (processPayload) => {

        console.log('Message from parent ---------------->:', processPayload);


        mailConstData.html = html_template(processPayload);

        // let timer = setTimeout(function () {

        //     clearTimeout(timer);
        //     process.send({ msg: 'OK', pid: process.pid });

        // }, 1800);

        // I'd like to know if we can be there today.
        var mailOptions = {
            from: '"' + mailConstData.name + '" <' + mailConstData.email + '>',
            to: processPayload.email,
            // to: 'victorodairo@gmail.com', 
            // subject: 'A big shoutout from NewsAfrica', 
            subject: mailConstData.subject,
            // text: mailConstData.message,
            html: mailConstData.html
            // html: '<h1>Welcome</h1><p>That was easy!</p>'
        };



        sendTheMail = () => {
            return new Promise(resolve => {

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        resolve(error);
                    } else {
                        resolve('Email sent: ' + info.response);
                    }
                });

            });
        }

        mailMessage = await sendTheMail();

        console.log('mailMessage : ', mailMessage);

        process.send({ msg: 'OK', pid: process.pid });

        

        // return { mailMessage };

    });


}

// lagMailer.sendMail();

// module.exports = lagMailer; 