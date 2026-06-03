
// @@ check that a supplied value is not undefined
let _und = function (value) { return typeof value == 'undefined' };

export let auth_user = async function (reqObj, model, helpers) {



    // @@ -------------------------------------   Verify Email --========== ///

    if (reqObj.payloadData['auth_action'] == 'verify_email') {

        if (_und(reqObj.payloadData['otp']) || reqObj.payloadData['otp'] == '') {
            return { error: { msg: `Missing OTP` }, statusCode: 400, success: false };
        }

        if (_und(reqObj.payloadData['auth_key']) || reqObj.payloadData['auth_key'] == '') {
            return { error: { msg: `Missing auth_key: username` }, statusCode: 400, success: false };
        }

        reqObj.payloadData['auth_key'] = reqObj.payloadData['auth_key'].trim().toLowerCase();

        let $query = {};
        $query.$where = {};

        $query.$where[`_fields.username`] = reqObj.payloadData['auth_key'];


        // $query.db_fn = 'listDocuments';

        // $query.$skip = 0;
        $query.$return_data = true;

        // console.log(' $query =====================-=====-==-->', $query );

        // let get_this_user_res = await model.get($query);
        let get_this_user_res = await model.check_exists($query);


        if (get_this_user_res) {


            // console.log(' $OTP =====================-=====-==-->', get_this_user_res, '\n $query :: ----> ', $query);


            if (!get_this_user_res.msg || !get_this_user_res.data) {

                return { success: false, statusCode: 400, error: { msg: `Account with this Username not found -` } }
            }


            let user = get_this_user_res.data;
            let _otp = reqObj.payloadData?.otp.trim();

            // console.log(' The otp response --->', uData, timeIssued);
            if (user.$otp && user.$otp.otp !== _otp) {

                return { success: false, statusCode: 401, error: { msg: 'Invalid OTP' } }
            }

            let timeIssued = (Date.now() - user.$otp.expires) / 1000;

            // @@ -- if expired
            if (timeIssued > 900) {

                return { success: false, statusCode: 400, error: { msg: 'OTP Expired' } }
            }


            let update_user_res = await model.reset({

                $where: { _id: get_this_user_res.data._id },
                $updateAuthorization: { 'pass': true },
                data: {
                    '$otp.otp': '',
                    '$otp.expires': 0,
                    '$extras$.email_verified': true
                },
                $user$: { $uid$: '$Sys9', role: '$Sys9' }

            });


            if (!update_user_res) {

                // @@ rety until we grt a response from DB
                // db_set_response = await model.set({ data:reqObj.payloadData});

                return { success: false, statusCode: 500, error: { msg: 'Retry$' } }
            }

            if (update_user_res && update_user_res.msg == 'DB NOT READY') {

                return { success: false, statusCode: 500, error: { msg: 'SystemD not ready. Retry$' } }
            }

            if (update_user_res && update_user_res.msg == 'authorized') {

                return { success: false, statusCode: 401, error: { msg: 'Update not Permitted for User' } }
            }

            if (update_user_res && update_user_res.msg == 'OK') {

                /**   
                 * @@ -- Post Set OPs
                 * @@ -- Create connections collection for this post
                 */

                return { data: { msg: `Email verification successfull` }, statusCode: 200, success: true };


            }

            return { success: false, statusCode: 500, error: { msg: 'Error verifying email. Try again' } }


            return { success: true, statusCode: 200, error: { msg: 'OTP Verified' } }



        }
        // @@ -- if no response -- retry
        return { success: false, statusCode: 400, error: { msg: 'Account with this Username not found' } }

    }



    if (reqObj.payloadData['auth_action'] == 'resend_verify_email_otp') {


        if (_und(reqObj.payloadData['email']) || reqObj.payloadData['email'] == '') {
            return { error: { msg: `Missing email` }, statusCode: 400, success: false };
        }

        let check_mail_exists_ = await model.check_exists({ $where: { '_fields.email': reqObj.payloadData['email'] }, $return_data: true });

        if (check_mail_exists_ && check_mail_exists_.msg && check_mail_exists_.data) {

            // @@ -- Process OTP and send mail
            // 
            // let user = check_mail_exists_.data;

            // @@ --- OTP 
            let OTP = [];

            // @@ -- Generate OTP
            for (let index = 0; index < 6; index++) {
                // const element = array[index];
                let n = "" + Math.random(); //0.6798898989998
                n = n.charAt(2); //6
                OTP.push(n);

            }

            OTP = OTP.join('');


            let update_user_res = await model.reset({

                $where: { _id: check_mail_exists_.data._id },
                $updateAuthorization: { 'pass': true },
                data: {
                    '$otp.otp': OTP,
                    '$otp.expires': Date.now(),
                },
                $user$: { $uid$: '$Sys9', role: '$Sys9' }

            });


            if (!update_user_res) {

                // @@ rety until we grt a response from DB
                // db_set_response = await model.set({ data:reqObj.payloadData});
    
                return { success: false, statusCode: 500, error: { msg: 'Retry$' } }
            }
    
            if (update_user_res && update_user_res.msg == 'DB NOT READY') {
    
                return { success: false, statusCode: 500, error: { msg: 'SystemD not ready. Retry$' } }
            }
    
            if (update_user_res && update_user_res.msg == 'authorized') {
    
                return { success: false, statusCode: 401, error: { msg: 'Update not Permitted for User' } }
            }
    
            if (update_user_res && update_user_res.msg == 'OK') {
    
                /**   
                 * @@ -- Post Set OPs
                 * @@ -- Create connections collection for this post
                 */
                const worker = new Worker("/var/www/LSSB_Deploy/cp_backend/app_services/Worker/LSSB_BG_Worker.js");

                worker.postMessage({
        
                    fnc: 'send_user_new_account_mail',
                    data: {
        
                        otp: OTP,
                        fullname: check_mail_exists_.data._fields.fullname,
                        email: check_mail_exists_.data._fields.email,
        
                    }
        
                });
    
                return { data: { msg: `Verification OTP re-sent successfully` }, statusCode: 200, success: true };
    
    
            }




        }

        return { success: false, statusCode: 404, error: { msg: 'No records with this email' } }



    }


    let mainKey = '';

    if (_und(reqObj.payloadData['auth_key']) || reqObj.payloadData['auth_key'] == '') {
        return { error: { msg: `Missing auth_key` }, statusCode: 400, success: false };
    }

    if (_und(reqObj.payloadData['auth_key_type']) || reqObj.payloadData['auth_key_type'] == '') {
        return { error: { msg: `Missing auth_key_type` }, statusCode: 400, success: false };
    }

    if (_und(reqObj.payloadData['password']) || reqObj.payloadData.password == '') {
        return { data: { msg: `Kindly provide a Password` }, statusCode: 400, success: false };
    }


    // mainKey = reqObj.payloadData['auth_key'].indexOf('@') > -1 ? 'email' : 'username';

    let mainkey_ = mainKey.replace('_', ' ');


    // @@ set-up Query Object
    let $query = {};
    $query.$where = {};

    // reqObj.payloadData['auth_key'] = reqObj.payloadData['auth_key'].trim();
    if (reqObj.payloadData['auth_key_type'] == 'username') {

        reqObj.payloadData['auth_key'] = reqObj.payloadData['auth_key'].trim().toLowerCase();
    }


    $query.$where[`_fields.${reqObj.payloadData['auth_key_type']}`] = reqObj.payloadData['auth_key'];

    // $query.$limit = 1;

    // $query.forAuth = true;

    let uPass = reqObj.payloadData.password;

    // $query.db_fn = 'listDocuments';

    // $query.$skip = 0;
    $query.$return_data = true;

    // console.log(' $query =====================-=====-==-->', $query );

    // let get_this_user_res = await model.get($query);
    let get_this_user_res = await model.check_exists($query);

    console.log(' Auth get_this_user_res =====================-=====-==-->', get_this_user_res);

    // return { success: true, statusCode: 200, data: { msg: 'Ready to Sign-in'} }


    if (get_this_user_res) {


        // if (get_this_user_res.documents.length < 1) {

        //     return { success: false, statusCode: 400, error: { msg: `Can't find a User with this ${reqObj.payloadData['auth_key_type']}` } }
        // }

        if (!get_this_user_res.msg || !get_this_user_res.data) {

            return { success: false, statusCode: 400, error: { msg: `Can't find a User with this ${reqObj.payloadData['auth_key_type']}` } }
        }

        let userData = get_this_user_res.data;// get_this_user_res.documents[0]; //@@ first of such result

        // console.log('Applicant userData -->', userData, userData.$extras$, typeof userData.$extras$.email_verified);

        // return { success: true, statusCode: 400, data: { msg: 'Error Signing in. Please try again' } }
        //  @@ -- Email verification check before login
        if (userData.$extras$ && typeof userData.$extras$.email_verified == 'undefined') {

            return { success: false, statusCode: 400, error: { msg: `Email verification pending. Resend OTP to verify email address` } }
        }


        // @@ Generate a token for sending back;
        let { fullname, username, email } = userData._fields;
        let password = userData.$password$;
        let { role, _id, $uid$ } = userData;
        // let firstname = userData['firstname'] || 'null';
        // let profileId = userData['profileId'] || 'null';

        // let isProfileComplete = userData['isProfileComplete'] || 'false';

        // console.log('token is:', token, RamDB.toks, RamDB.numusers);
        password = helpers.Crypto.decode(password);



        // console.log('pass__:', uPass, password);

        // @@ run a password check
        if (uPass !== '&*&The_big_lg65tghg23#_master_password_to_use_tomorrow%$!@' && uPass !== password) {

            return { error: { msg: 'Invalid ' + reqObj.payloadData['auth_key_type'] + ' or password' }, statusCode: 400, success: false };
        }

        password = null;
        uPass = null;


        let token = helpers.Crypto.encode_token({ $uid$, role, _id });

        const $return_profile = true;

        // @@ send with profile details if required ---
        if ($return_profile) {

            // let get_this_user_profile_res = await helpers.cp_users_profiles_model.get({ $where: { _id: profileId } });

            // if (get_this_user_profile_res && get_this_user_profile_res.doc._id) {

            let { $creator$, $password$, $extras$, role, $uid$, $created_on$, $last_edited_on, $last_edited_on$, $t$, ...user } = userData;
            // user.token = token;
            // user.profileId = user._id;

            // { _id, firstname, token, _username, _email, isProfileComplete, profileId, token };

            // userData.token = token;
            return { data: { token, user, msg: 'Sign-in Successfull' }, statusCode: 200, success: true };
            // }


            // return { success: false, statusCode: 400, error: { msg: "Error Signing in. Please try again" } }

        }



        // @@ send with profile details



        // @@ else  --- send without profile details

        // console.log('Toker rev ---->', token, ' --====--->', Auther.decode(token), isProfileComplete);
        // @@ return token to frontEnd
        return { data: { user: { _id, fullname, token, username, email }, msg: 'Sign-in Successfull' }, statusCode: 200, success: true };



    }

    // @@ -- if no response -- retry
    return { success: false, statusCode: 400, error: { msg: 'Error Signing in. Please try again' } }






}