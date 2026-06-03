import { sendPasswordResetMail } from "./mailer.js";

// @@ check that a supplied value is not undefined
let _und = function (value) { return typeof value == 'undefined' };

export let initiate_reset_password = async function (reqObj, model, helpers) {



    try {

        let mainKey = '';

        if (_und(reqObj.payloadData['email']) || reqObj.payloadData['email'] == '') {
            return { error: { msg: `Missing email` }, statusCode: 400, success: false };
        }



        // mainKey = reqObj.payloadData['auth_key'].indexOf('@') > -1 ? 'email' : 'username';

        // @@ -- 'generate_uid': 'username',
        let emailOne = reqObj.payloadData.email.trim();

        

        // @@ -- unique check here when get is ready
        let check_mail_exists_ = await model.check_exists({ $where: { '_fields.email': emailOne }, $return_data: true });

        console.log(' check_mail_exists_ ---=>>', check_mail_exists_, 'model', '\n ---->>', helpers.fromModel );

        if (check_mail_exists_ && check_mail_exists_.msg && check_mail_exists_.data ) {

            // @@ -- Process OTP and send mail
            // 
            let OTP = [];

            // @@ -- Generate OTP
            for (let index = 0; index < 6; index++) {
                // const element = array[index];
                let n = "" + Math.random(); //0.6798898989998
                n = n.charAt(2); //6
                OTP.push(n);

            }

            OTP = OTP.join('');

            // console.log('OTP --=>', OTP);

            let update_post_res = await model.reset({

                $where: { _id: check_mail_exists_.data._id },
                $updateAuthorization: { 'pass': true },
                data: {
                    '$otp.otp': OTP,
                    '$otp.expires': Date.now(), // check for 5 mins expiration

                },
                $user$: { $uid$: '$Sys9', role: '$Sys9' }

            });


            // @@ -- 
            if (!update_post_res) {

                // @@ rety until we grt a response from DB
                // db_set_response = await model.set({ data:reqObj.payloadData});

                return { success: false, statusCode: 500, error: { msg: 'Retry$' } }
            }

            if (update_post_res && update_post_res.msg == 'DB NOT READY') {

                return { success: false, statusCode: 500, error: { msg: 'SystemD not ready. Retry$' } }
            }

            if (update_post_res && update_post_res.msg == 'authorized') {

                return { success: false, statusCode: 401, error: { msg: 'Update not Permitted for User' } }
            }

            if (update_post_res && update_post_res.msg == 'OK') {

                /**   
                 * @@ -- Post Set OPs
                 * @@ -- Create connections collection for this post
                 */

                await sendPasswordResetMail({ otp: OTP, email: emailOne });

                return { data: { msg: `OTP sent to ${emailOne}` }, statusCode: 200, success: true };


            }

        }

        return { success: false, statusCode: 404, error: { msg: 'No records with this email' } }



    } catch (error) {

        console.log('error :: -->', error );
        return { success: false, statusCode: 500, error: { msg: 'Error Resetting Pass. Try again' } }

    }






}