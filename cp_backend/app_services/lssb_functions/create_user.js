
// 
const validate_uname = function (val) {

    // console.log('val username --=>', /^[A-Za-z_0-9]*$/.test(val), val);

    return /^[a-zA-Z0-9_]+$/.test(val);

}

const validate_password = function (val) {


    return /^[A-Za-z0-9\_\@\(\)\#\*\\\|\{}[\]"'?/\$\!\~\,:;<>\`.=+%\^\-&]*$/.test(val)

};

export let create_user = async function (reqObj, model, helpers) {


    /**   
    * @@ -- Pre Set OPs
    */

    if (typeof reqObj.payloadData._fields == 'undefined') {

        return { success: true, statusCode: 400, error: { msg: 'Data fields missing!' } }
    }

    if (!reqObj.payloadData._fields.lassra && !reqObj.payloadData._fields.nin && !reqObj.payloadData._fields.username) {

        return { success: false, statusCode: 400, error: { msg: 'Either NIN, LASSRA or Username required' } }
    }

    if (!reqObj.payloadData._fields.fullname || reqObj.payloadData._fields.fullname == '') {

        return { success: false, statusCode: 400, error: { msg: 'Fullname required' } }
    }

    if (!reqObj.payloadData._fields.division || reqObj.payloadData._fields.division == '') {

        return { success: false, statusCode: 400, error: { msg: 'Division required' } }
    }

    if (!reqObj.payloadData._fields.email || reqObj.payloadData._fields.email == '') {

        return { success: false, statusCode: 400, error: { msg: 'Email is required' } }
    }


    if (!reqObj.payloadData._academic_criteria || !reqObj.payloadData._academic_criteria.studentship_status || !reqObj.payloadData._academic_criteria.indigeneship_status) {

        return { success: false, statusCode: 400, error: { msg: 'Missiing Academic criteria, Studentship or Indigeneship status ' } }
    }



    if (!validate_password(reqObj.payloadData._fields.password)) {

        return { success: false, statusCode: 400, error: { msg: 'unallowed character in password' } }

    }

    // @@ -======================== 'matching Pass': [ { 'password': 'confirm_password' } ]
    if (reqObj.payloadData._fields.password !== reqObj.payloadData._fields.confirm_password) {

        return { success: false, statusCode: 400, error: { msg: 'Passwords do not match!' } }

    };

    // @@ email check


    // @@ -======================== Encrypt Password
    // reqObj.payloadData._fields.password = helpers.Crypto.encode(reqObj.payloadData._fields.password);

    reqObj.payloadData.$password$ = helpers.Crypto.encode(reqObj.payloadData._fields.password);

    delete reqObj.payloadData._fields.confirm_password;
    delete reqObj.payloadData._fields.password;

    reqObj.payloadData._fields.email = reqObj.payloadData._fields.email.trim().toLowerCase();




    // @@ if a username exists
    if (reqObj.payloadData._fields.username) {

        // @@ -- 'generate_uid': 'username',
        // reqObj.payloadData._fields.username = reqObj.payloadData._fields.username.trim();


        reqObj.payloadData._fields.username = reqObj.payloadData._fields.username.trim().toLowerCase();


        if (!validate_uname(reqObj.payloadData._fields.username)) {

            return { success: false, statusCode: 400, error: { msg: 'Only letters, numbers and \n underscore allowed for Username' } }

        }

        if (reqObj.payloadData._fields.username.length < 6) {

            return { success: false, statusCode: 400, error: { msg: '6 characters or more required for Username' } }

        }

        // @@ -- unique check here when get is ready
        let check_unique_ = await model.check_exists({ $where: { '_fields.username': reqObj.payloadData._fields.username } });

        // console.log(' check_unique_ ---=>>', check_unique_);

        if (check_unique_ && check_unique_.msg) {

            return { success: false, statusCode: 400, error: { msg: 'Username already exists' } }
        }

    }

    // @@ if email exists
    if (reqObj.payloadData._fields.email) {

        // @@ -- 'generate_uid': 'username',
        reqObj.payloadData._fields.email = reqObj.payloadData._fields.email.trim();

        // @@ -- unique check here when get is ready
        let check_unique_ = await model.check_exists({ $where: { '_fields.email': reqObj.payloadData._fields.email } });

        // console.log(' check_unique_ ---=>>', check_unique_);

        if (check_unique_ && check_unique_.msg) {

            return { success: false, statusCode: 400, error: { msg: 'Email already exists' } }
        }

    }

    // @@ if a username exists
    if (reqObj.payloadData._fields.lassra) {

        // @@ -- 'generate_uid': 'username',
        reqObj.payloadData._fields.lassra = reqObj.payloadData._fields.lassra.trim();



        // @@ -- unique check here when get is ready
        let check_unique_ = await model.check_exists({ $where: { '_fields.lassra': reqObj.payloadData._fields.lassra } });

        // console.log(' check_unique_ ---=>>', check_unique_);

        if (check_unique_ && check_unique_.msg) {

            return { success: false, statusCode: 400, error: { msg: 'LASSRA already exists' } }
        }

    }

    // @@ if a username exists
    if (reqObj.payloadData._fields.nin) {

        // @@ -- 'generate_uid': 'username',
        reqObj.payloadData._fields.nin = reqObj.payloadData._fields.nin.trim();



        // @@ -- unique check here when get is ready
        let check_unique_ = await model.check_exists({ $where: { '_fields.nin': reqObj.payloadData._fields.nin } });

        // console.log(' check_unique_ ---=>>', check_unique_);

        if (check_unique_ && check_unique_.msg) {

            return { success: false, statusCode: 400, error: { msg: 'NIN already exists' } }
        }

    }






    // return { success: true, statusCode: 200, data: { msg: 'Now Creating Account!'} }

    let $uid$ = helpers.utils.generate_uid(reqObj.payloadData._fields.username || reqObj.payloadData._fields.lassra || reqObj.payloadData._fields.nin) + helpers.aNode;

    // @@ process __creator once and for all
    //  if (dataToProcess['__creator_'] && (dataToProcess['__creator_'] == 'null' || dataToProcess['__creator_'] == 'System_' || dataToProcess['__creator_'] == '$System$' )) {
    //     dataToProcess['__creator_'] = fs;
    // }

    reqObj.payloadData['$uid$'] = $uid$;
    reqObj.payloadData['$creator$'] = $uid$;

    // @@ all Docs should have an extra for later fields
    reqObj.payloadData['$extras$'] = { '$n': 'n'};

    reqObj.payloadData['role'] = '_LSSB_user';


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

    // console.log('OTP --=>', OTP);
    reqObj.payloadData['$otp'] = { 'otp': OTP, 'expires':  Date.now() };
    // reqObj.payloadData['$otp'] = Date.now();



    let db_set_response = await model.set({ data: reqObj.payloadData, $afterSetFnc: 'after_create_lssb_user' });

    console.log(' creating --- -----00---- Applicant account _uid -===>', reqObj.payloadData, '\n db_set_response --=>>>>', db_set_response);




    if (!db_set_response) {

        // @@ rety until we grt a response from DB
        // db_set_response = await model.set({ data:reqObj.payloadData});

        return { success: false, statusCode: 500, error: { msg: 'Retry$' } }
    }

    if (db_set_response && db_set_response.msg == 'DB NOT READY') {

        return { success: false, statusCode: 500, error: { msg: 'SystemD not ready. Retry$' } }
    }

    if (db_set_response && db_set_response.msg == 'OK') {

        // console.log('send mail now man :: --->', '23' );
        // @@ send mail ---- 

        const worker = new Worker("/var/www/LSSB_Deploy/cp_backend/app_services/Worker/LSSB_BG_Worker.js");

        worker.postMessage({

            fnc: 'send_user_new_account_mail',
            data: {

                otp: OTP,
                fullname: reqObj.payloadData._fields.fullname,
                email: reqObj.payloadData._fields.email,

            }

        });


        return { success: true, statusCode: 200, data: { _id: db_set_response._id, msg: 'User Account Created! OTP sent to email for verfication!' } }




    }

    return { success: false, statusCode: 500, error: { msg: 'Error creating Account! Please try again' } }



}


