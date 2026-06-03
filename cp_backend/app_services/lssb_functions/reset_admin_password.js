
// @@ check that a supplied value is not undefined
let _und = function (value) { return typeof value == 'undefined' };

export let reset_admin_password = async function (reqObj, model, helpers) {



    try {

        let mainKey = '';

        if (_und(reqObj.payloadData['password']) || reqObj.payloadData['password'] == ''
            || _und(reqObj.payloadData['confirm_password']) || reqObj.payloadData['confirm_password'] == '') {
            return { error: { msg: `Password or confirm password missing` }, statusCode: 400, success: false };
        }


        if (reqObj.payloadData['password'] !== reqObj.payloadData['confirm_password']) {
            return { error: { msg: `Passwords do not match` }, statusCode: 400, success: false };
        }





        if (reqObj.payloadData['reset_token']) {

            // @@ encode special tok_id in reset_token upon create.. then 
            // -- save upon reset..
            // -- run a check later for ids that have previously been used and throw a 
            // -- expired or invalid token error

            let decodedTok = helpers.Crypto.decode(reqObj.payloadData['reset_token']);



            if (!decodedTok._id || !decodedTok.expires) {


                return { error: { msg: `Invalid Reset Token` }, statusCode: 400, success: false };

            }

            decodedTok.expires = parseInt(decodedTok.expires);

            if (!decodedTok.expires > 7200) {
                // @@ -- if expired
                // if (timeIssued > 300) {

                    return { success: false, statusCode: 400, error: { msg: 'Activation link Expired. Contact super admin' } }
                // }
            }




            // @@ else proceed fo get by _id
            let passwordOne = reqObj.payloadData.password.trim();



            // @@ --------------- Reset OPs

            passwordOne = helpers.Crypto.encode(passwordOne);

            // let data = { '_fields.password': passwordOne };
            let data = { '$password$': passwordOne };

            // '': passwordOne

            // data[`$extras.activation_links.${decodedTok.expires}`] = decodedTok.expires;

            // @@ write an update if function in DB to check...

            let update_admin_res = await model.reset({

                $where: { _id: decodedTok._id },
                $updateAuthorization: { 'pass': true },
                data,
                $user$: { $uid$: '$Sys9', role: '$Sys9' }

            });

            // @@ -- 
            if (!update_admin_res) {

                // @@ rety until we grt a response from DB
                // db_set_response = await model.set({ data:reqObj.payloadData});

                return { success: false, statusCode: 500, error: { msg: 'Retry$' } }
            }

            if (update_admin_res.msg == 'DB NOT READY') {

                return { success: false, statusCode: 500, error: { msg: 'SystemD not ready. Retry$' } }
            }

            if (update_admin_res.msg == 'authorized') {

                return { success: false, statusCode: 401, error: { msg: 'Update not Permitted for User' } }
            }

            if (update_admin_res.msg == 'Docs not found') {

                return { success: false, statusCode: 404, error: { msg: 'Error finding Account to reset. Cross-check token and try again' } }

            }

            if (update_admin_res.msg == 'OK') {

                /**   
                 * @@ -- Post Set OPs
                 * @@ -- Create connections collection for this post
                 */


                return { data: { msg: `Password reset successfull` }, statusCode: 200, success: true };


            }

            return { success: false, statusCode: 500, error: { msg: 'Error resetting password. Try again' } }


            // return { success: false, statusCode: 500, error: { msg: 'Error finding Account to reset. Try again ' } }


            // return { error: { msg: `Error setting up password` }, statusCode: 500, success: false };
        }






















        // @@ --- standard rest below





















        if (_und(reqObj.payloadData['otp']) || reqObj.payloadData['otp'] == '') {
            return { error: { msg: `OTP required` }, statusCode: 400, success: false };
        }

        if (_und(reqObj.payloadData['email']) || reqObj.payloadData['email'] == '') {
            return { error: { msg: `Missing email` }, statusCode: 400, success: false };
        }


        // mainKey = reqObj.payloadData['auth_key'].indexOf('@') > -1 ? 'email' : 'username';

        // @@ -- 'generate_uid': 'username',
        let emailOne = reqObj.payloadData.email.trim();
        let passwordOne = reqObj.payloadData.password.trim();
        let _otp = reqObj.payloadData.otp.trim();


        // @@ -- unique check here when get is ready
        let check_mail_exists_ = await model.check_exists({ $where: { '_fields.email': emailOne }, $return_data: true });

        // console.log(' check_mail_exists_ ---=>>', check_mail_exists_);

        if (check_mail_exists_ && check_mail_exists_.msg && check_mail_exists_.data) {

            // @@ -- Process OTP and send mail
            // 
            let user = check_mail_exists_.data


            // console.log(' The otp response --->', uData, timeIssued);
            if (user.$otp && user.$otp.otp !== _otp) {

                return { success: false, statusCode: 401, error: { msg: 'Invalid OTP' } }
            }

            let timeIssued = (Date.now() - user.$otp.expires) / 1000;

            // @@ -- if expired
            if (timeIssued > 300) {

                return { success: false, statusCode: 400, error: { msg: 'OTP Expired' } }
            }

            passwordOne = helpers.Crypto.encode(passwordOne);

            let update_admin_res = await model.reset({

                $where: { _id: check_mail_exists_.data._id },
                $updateAuthorization: { 'pass': true },
                data: {
                    '$otp.otp': '',
                    '$otp.expires': 0,
                    '$password$': passwordOne

                },
                $user$: { $uid$: '$Sys9', role: '$Sys9' }

            });

            // @@ -- 
            if (!update_admin_res) {

                // @@ rety until we grt a response from DB
                // db_set_response = await model.set({ data:reqObj.payloadData});

                return { success: false, statusCode: 500, error: { msg: 'Retry$' } }
            }

            if (update_admin_res && update_admin_res.msg == 'DB NOT READY') {

                return { success: false, statusCode: 500, error: { msg: 'SystemD not ready. Retry$' } }
            }

            if (update_admin_res && update_admin_res.msg == 'authorized') {

                return { success: false, statusCode: 401, error: { msg: 'Update not Permitted for User' } }
            }

            if (update_admin_res && update_admin_res.msg == 'OK') {

                /**   
                 * @@ -- Post Set OPs
                 * @@ -- Create connections collection for this post
                 */



                return { data: { msg: `Password reset successfull` }, statusCode: 200, success: true };


            }

            return { success: false, statusCode: 500, error: { msg: 'Error resetting password. Try again' } }

        }

        return { success: false, statusCode: 404, error: { msg: 'No record with this email found' } }



    } catch (error) {

        console.log('error :: -->', error);
        return { success: false, statusCode: 500, error: { msg: 'Error Resetting Pass. Try again' } }

    }



}