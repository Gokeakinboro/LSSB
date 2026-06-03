

// var nodemailer = require('nodemailer');
import nodemailer from "nodemailer";

// import { unlink } from "node:fs/promises";
// let nodemailer = {};

let html_template = require('./lssb_mail_temp');

let user_account_mail_temp = require('./user_account_mail_temp');
let application_success_mail_temp = require('./application_success_mail_temp');

let admin_html_template = require('./lssb_admin_welcome_mail_temp');

// lssb_admin_welcome_mail_temp

console.log(' Mailer launched  ::: -->', 'data');

let transporter = nodemailer.createTransport({

    host: 'premium70.web-hosting.com',
    // host: 'smtp.mailersend.net',
    // host: 'in-v3.mailjet.com',
    port: 465,

    // mail jet
    // port: 587,
    secureConnection: true,
    auth: {
        user: 'info@lagosscholarship.org',
        // user: "MS_7Iozqg@lagosscholarship.org",
        // user: 'MS_UTGrIY@test-q3enl6ky0wm42vwr.mlsender.net',
        
        pass: 'B0ardm@ster2023'
        // pass: 'mssp.CAWudbo.3zxk54vor7xgjy6v.JOq1yi1'
        // pass: 'mssp.ZLRCSq9.3vz9dledv1n4kj50.bVTjvwH'


        // user: '88c57c18585561bb97dc7ba5a4e741bf',
        // pass: '57b818f8795bef40f69b43a47597defc'

    }
});


let mailConstData = {
    name: 'LSSB',
    email: 'info@lagosscholarship.org',
    subject: 'Password Reset Request',
    // destinationEmail: 'victorodairo@gmail.com',

};

const SqyWorkerFncs = {};

let current_fnc = '';

SqyWorkerFncs.send_mail = async function (data) {

    return new Promise(async (resolve, reject) => {

        console.log(' now sending mail ::: -->', data);

        data.subject = mailConstData.subject;

        mailConstData.html = current_fnc == 'send_admin_welcome_mail' ? admin_html_template(data) : html_template(data);

        if (current_fnc == 'send_user_new_account_mail' || current_fnc == 'send_application_success_mail') {
            mailConstData.subject = current_fnc == 'send_application_success_mail' ? "Application Successful" : 'Account Activation';
            data.subject = current_fnc == 'send_application_success_mail' ? "Application Successful"  : 'Account Activation';
            mailConstData.html =  current_fnc == 'send_application_success_mail' ? application_success_mail_temp(data) : user_account_mail_temp(data);
        }

        var mailOptions = {
            from: '"' + mailConstData.name + '" <' + mailConstData.email + '>',
            to: data.email,
            // to: 'victorodairo@gmail.com', 
            // subject: 'A big shoutout from NewsAfrica', 
            subject: current_fnc == 'send_admin_welcome_mail' ? 'Staff Account Creation' : mailConstData.subject,
            // text: mailConstData.message,
            html: mailConstData.html
            // html: '<h1>Welcome</h1><p>That was easy!</p>'
        };

        let sendTheMail = async () => {
            return new Promise(resolve => {

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {

                        console.log('mail send error --->', error);
                        resolve(error);

                    } else {

                        console.log('mail send ok --->', info.response);
                        resolve('OK');
                        // resolve('OK');
                    }
                });

            });
        }

        let mailMessage = await sendTheMail();

        console.log('mailMessage : ', mailMessage);

        if (mailMessage == 'OK') {
            resolve('done');
        }


    })
}


SqyWorkerFncs.send_admin_welcome_mail = SqyWorkerFncs.send_mail;

SqyWorkerFncs.send_user_new_account_mail = SqyWorkerFncs.send_mail;


// SqyWorkerFncs.send_mail({

//     otp: '9983',
//     email: 'victorodairo@gmail.com'// reqObj.payloadData['reset_email']

// })

// Worker thread:
self.addEventListener("message", async (event) => {

    setTimeout(function () {

        console.log('LSSB worker Message received ::: ---- >', event.data);

    }, 600)

    // const work_id = event.data.job + '_' + Date.now();
    // const work_id = event.data.job + '_' + Date.now();

    let job = { ...event.data };

    current_fnc = job.fnc;

    // SqyWorker.queue.set(work_id, job);
    let res = await SqyWorkerFncs[current_fnc](job.data);

    if (res == 'done') {


        console.log(' Job done . Mail sent ---->');

        process.exit();

        // -- delete job then call next
        // SqyWorkerFncs.unset_job(current_job_key);

    }

    // await Bun.write(`./Worker/jobs/${work_id}.json`, JSON.stringify(job));

    // runJob();



    // }, 800);

});

self.onclose = (event) => {

    setTimeout(async function () {

        console.log('worker closed ----', event);
        // postMessage("world");
        // await Bun.write('./runnin.txt', 'true');
        process.exit();

    }, 800);
};




// setTimeout(function () {

//     console.log('LSSB worker running --- ::: -- >')

//     runJob();

// }, 800);

setInterval(function () {

    // console.log('LSSB worker 0 running --- ::: -- >', process.pid);
    // process.exit();
}, 2000);



