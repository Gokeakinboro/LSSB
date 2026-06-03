
// @@ check that a supplied value is not undefined
let _und = function (value) { return typeof value == 'undefined' };

export let reset_password = async function (reqObj, model, helpers) {



    try {

        let mainKey = '';

        if (_und(reqObj.payloadData['otp']) || reqObj.payloadData['otp'] == '') {
            return { error: { msg: `OTP required` }, statusCode: 400, success: false };
        }

        if (_und(reqObj.payloadData['email']) || reqObj.payloadData['email'] == '') {
            return { error: { msg: `Missing email` }, statusCode: 400, success: false };
        }

        if (_und(reqObj.payloadData['password']) || reqObj.payloadData['password'] == ''
            || _und(reqObj.payloadData['confirm_password']) || reqObj.payloadData['confirm_password'] == '') {
            return { error: { msg: `Password or confirm password missing` }, statusCode: 400, success: false };
        }


        if (reqObj.payloadData['password'] !== reqObj.payloadData['confirm_password']) {
            return { error: { msg: `Passwords do not match` }, statusCode: 400, success: false };
        }


        // mainKey = reqObj.payloadData['auth_key'].indexOf('@') > -1 ? 'email' : 'username';

        // @@ -- 'generate_uid': 'username',
        let emailOne = reqObj.payloadData.email.trim();
        let passwordOne = reqObj.payloadData.password.trim();
        let _otp = reqObj.payloadData.otp.trim();


        // @@ -- unique check here when get is ready
        let check_mail_exists_ = await model.check_exists({ $where: { '_fields.email': emailOne }, $return_data: true });

        // console.log(' check_mail_exists_ ---=>>', check_mail_exists_);

        if ( check_mail_exists_ && check_mail_exists_.msg && check_mail_exists_.data ) {

            // @@ -- Process OTP and send mail
            // 
            let user = check_mail_exists_.data


            // console.log(' The otp response --->', uData, timeIssued);
            if ( user.$otp && user.$otp.otp !== _otp ) {

                return { success: false, statusCode: 401, error: { msg: 'Invalid OTP' } }
            }

            let timeIssued = (Date.now() - user.$otp.expires) / 1000;

            // @@ -- if expired
            if (timeIssued > 300) {

                return { success: false, statusCode: 400, error: { msg: 'OTP Expired' } }
            }

            passwordOne = helpers.Crypto.encode(passwordOne);

            let update_post_res = await model.reset({

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

            

                return { data: { msg: `Password reset successfull` }, statusCode: 200, success: true };


            }

            return { success: false, statusCode: 500, error: { msg: 'Error resetting password. Try again' } }

        }

        return { success: false, statusCode: 404, error: { msg: 'No records with this email' } }



    } catch (error) {

        console.log('error :: -->', error );
        return { success: false, statusCode: 500, error: { msg: 'Error Resetting Pass. Try again' } }

    }



}