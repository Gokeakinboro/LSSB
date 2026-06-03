
const allowed_roles = ['xSuperLSSBxAdmin', 'xLSSBxAdmin', '$Sys9'];

let schema_keys = ['username', 'email', 'fullname', 'staff_id', 'role', 'unit'];


const validate_uname = function (val) {

    // console.log('val username --=>', /^[A-Za-z_0-9]*$/.test(val), val);

    return /^[a-zA-Z0-9_]+$/.test(val);

}

const validate_password = function (val) {


    return /^[A-Za-z0-9\_\@\(\)\#\*\\\|\{}[\]"'?/\$\!\~\,:;<>\`.=+%\^\-&]*$/.test(val)

};

export let create_admin = async function (reqObj, model, helpers) {


    // if (reqObj.payloadData.cloud_action == 'create_account') {}

    // console.log('creating --- -----00---- User account -===>', reqObj.payloadData, 'auth -->', helpers.auth$ );
    if (!reqObj.payloadData._fields.fullname || reqObj.payloadData._fields.fullname == '') {

        return { success: false, statusCode: 400, error: { msg: 'Fullname required' } }
    }

    if (!reqObj.payloadData._fields.email || reqObj.payloadData._fields.email == '') {

        return { success: false, statusCode: 400, error: { msg: 'Email required' } }
    }

    if (!reqObj.payloadData._fields.username || reqObj.payloadData._fields.username == '') {

        return { success: false, statusCode: 400, error: { msg: 'Username required' } }
    }

    // @@ --- Allowed roles to create
    if ( !helpers.auth$ ) {
        return { error: { msg: 'Authorization required. Kindly login!!' }, statusCode: 401, success: false };
    }

    if (typeof reqObj.auth_expires == 'number'
        && typeof helpers.auth$ == 'object' && helpers.auth$ !== null
        && typeof helpers.auth$.timeSinceIssued == 'number' &&
        auth$.timeSinceIssued > reqObj.auth_expires

    ) {

        return { error: { msg: 'Expired Authorization. Kindly login again!!' }, statusCode: 401, success: false };
    }

    if (!helpers.auth$.role || allowed_roles.indexOf(helpers.auth$.role) == -1) {

        return { error: { msg: 'Unauthorized Operation' }, statusCode: 401, success: false };
    }


    /**   
     * @@ -- Pre Set OPs
     */
    if (typeof reqObj.payloadData._fields == 'undefined') {

        return { success: true, statusCode: 400, error: { msg: 'No data field provided' } }
    }

    if ( !validate_uname(reqObj.payloadData._fields.username) ) {

        return { success: false, statusCode: 400, error: { msg: 'Only letters, numbers and \n underscore allowed for Username' } }

    }


    reqObj.payloadData._fields.email = reqObj.payloadData._fields.email.trim().toLowerCase();
    reqObj.payloadData._fields.username = reqObj.payloadData._fields.username.trim().toLowerCase();

    // if ( !validate_password(reqObj.payloadData._fields.password) ) {

    //     return { success: false, statusCode: 400, error: { msg: 'unallowed character in password' } }

    // }

    // // @@ -======================== 'matching Pass': [ { 'password': 'confirm_password' } ]
    // if (reqObj.payloadData._fields.password !== reqObj.payloadData._fields.confirm_password) {

    //     return { success: false, statusCode: 400, error: { msg: 'Passwords do not match!' } }

    // };



    // @@ email check

    // if (reqObj.payloadData._fields.email) {

    // @@ -- unique check here when get is ready
    let check_unique_email = await model.check_exists({ $where: { '_fields.email': reqObj.payloadData._fields.email } });

    // console.log('check_unique_email ---=>>', check_unique_email);

    if (check_unique_email && check_unique_email.msg) {

        //  return { success: true, statusCode: 400, data: { msg: 'Email already exists'} }
        return { success: false, statusCode: 400, error: { msg: 'Email already exists' } }
    }

    // }




    // @@ -======================== Encrypt Password
    // reqObj.payloadData._fields.password = helpers.Crypto.encode(reqObj.payloadData._fields.password);

    // delete reqObj.payloadData._fields.confirm_password;

    // @@ -- 'generate_uid': 'username',
    // reqObj.payloadData._fields.username = reqObj.payloadData._fields.username.trim();


    // @@ passwords if exist
    // delete reqObj.payloadData._fields.password;
    // delete reqObj.payloadData._fields.password;

    // delete reqObj.payloadData.password;
    // delete reqObj.payloadData.password;




    // @@ -- unique check here when get is ready
    let check_unique_username = await model.check_exists({ $where: { '_fields.username': reqObj.payloadData._fields.username } });

    // console.log(' check_unique_username ---=>>', check_unique_username);

    if (check_unique_username && check_unique_username.msg) {

        return { success: false, statusCode: 400, error: { msg: 'Username already exists' } }
    }


    // return { success: true, statusCode: 200, data: { msg: 'Now Creating Account!'} }

    let $uid$ = helpers.utils.generate_uid(reqObj.payloadData._fields.username) + helpers.aNode;

    // @@ process __creator once and for all
    //  if (dataToProcess['__creator_'] && (dataToProcess['__creator_'] == 'null' || dataToProcess['__creator_'] == 'System_' || dataToProcess['__creator_'] == '$System$' )) {
    //     dataToProcess['__creator_'] = fs;
    // }

    let setData = { _fields: {} };

    schema_keys.forEach(k => {

        setData._fields[k] = reqObj.payloadData._fields[k] || 'null';

    });


    if (reqObj.payloadData.capabilities) {
        setData.capabilities = reqObj.payloadData.capabilities;
    }


    setData['$uid$'] = $uid$;
    setData['$creator$'] = $uid$;

    // @@ all Docs should have an extra for later fields
    setData['$extras$'] = {};

    setData['role'] = 'xLSSBxAdmin';

    // @@ -- Process OTP and send mail
    // 
    // let OTP = [];

    // // @@ -- Generate OTP
    // for (let index = 0; index < 6; index++) {
    //     // const element = array[index];
    //     let n = "" + Math.random(); //0.6798898989998
    //     n = n.charAt(2); //6
    //     OTP.push(n);

    // }

    // OTP = OTP.join('');

    // setData['$otp.otp'] = OTP;
    // setData['$otp.expires'] = Date.now(); // check for 5 mins expiration
    // setData['$link'] = '';

    let db_set_response = await model.set({ data: setData });

    console.log(' creating --- -----00---- Admin account _uid -===>', setData, '\n db_set_response --=>>>>', db_set_response);

    // @@ -- 'encrypt_data_keys': 'password',

    // return { success: true, statusCode: 200, data: { msg: 'Now Creating Account!'} }

    if (!db_set_response) {

        // @@ rety until we grt a response from DB
        // db_set_response = await model.set({ data:reqObj.payloadData});

        return { success: false, statusCode: 500, error: { msg: 'Retry$' } }
    }

    if (db_set_response && db_set_response.msg == 'DB NOT READY') {

        return { success: false, statusCode: 500, error: { msg: 'SystemD not ready. Retry$' } }
    }

    if (db_set_response && db_set_response.msg == 'OK') {


        /**   
         * @@ -- Post Set OPs
         */

        // @@ -======================== 'matching_values': [ { 'password': 'confirm_password' } ]
        // post_set_ops_: {
        //     'generate_encrypted_data': { 'token': ['$uid$', 'role'] },
        // },
        // const { username, role, email } = reqObj.payloadData;

        // let token = helpers.Crypto.encode_token({ $uid$, role });

        // @@ ---- Hater ---- //
        // let toks = helpers.Crypto.encode_token({ email: setData._fields.email, _id: db_set_response._id });

        let toks = helpers.Crypto.encode_token({ _id: db_set_response._id, expires: ""+Date.now() });


        // console.log('OTP --=>', OTP);

        /**   
            * @@ -- Post Set OPs
            * @@ -- Create connections collection for this post
            */

        // const worker = new Worker("./Worker/LSSB_BG_Worker.js");
        const worker = new Worker("/var/www/LSSB_Deploy/cp_backend/app_services/Worker/LSSB_BG_Worker.js");

        worker.postMessage({

            fnc: 'send_admin_welcome_mail',
            data: {

                // otp: OTP,
                fullname: setData._fields.fullname,
                email: setData._fields.email,
                // link: `https://lssbadmin.vercel.app/createpassword?t=${toks}&staff_id=${db_set_response._id}`
                // link: `https://lssbadmin.vercel.app/createpassword?t=${toks}`
                link: `https://admin.lagosscholarship.org/createpassword?t=${toks}`

            }
        });


        return { success: true, statusCode: 200, data: { msg: 'Admin Created!. OTP sent to email for password Reset.' } }

        // let update_post_res = await model.reset({

        //     $where: { _id: db_set_response._id },
        //     $updateAuthorization: { 'pass': true },
        //     data: {
        //         '$otp.otp': OTP,
        //         '$otp.expires': Date.now(), // check for 5 mins expiration
        //         '$link': ''

        //     },
        //     $user$: { $uid$: '$Sys9', role: '$Sys9' }

        // });

        // @@ -- 
        // if (!update_post_res) {

        //     // @@ rety until we grt a response from DB
        //     // db_set_response = await model.set({ data:reqObj.payloadData});

        //     return { success: false, statusCode: 500, error: { msg: 'Retry$' } }
        // }

        // if (update_post_res && update_post_res.msg == 'DB NOT READY') {

        //     return { success: false, statusCode: 500, error: { msg: 'SystemD not ready. Retry$' } }
        // }

        // if (update_post_res && update_post_res.msg == 'authorized') {

        //     return { success: false, statusCode: 401, error: { msg: 'Update not Permitted for User' } }
        // }

        // if (update_post_res && update_post_res.msg == 'OK') {




        //     // return { success: true, statusCode: 200, data: { token, _id: db_set_response._id, username, email, msg: 'Account Created!' } }
        // }

        // return { success: false, statusCode: 500, error: { msg: 'Error creating Admin!' } }
    }

    return { success: false, statusCode: 500, error: { msg: 'Error creating Admin!' } }
}