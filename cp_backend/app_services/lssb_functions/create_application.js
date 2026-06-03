
// 
const validate_uname = function (val) {

    // console.log('val username --=>', /^[A-Za-z_0-9]*$/.test(val), val);

    return /^[a-zA-Z0-9_]+$/.test(val);

}

const validate_password = function (val) {


    return /^[A-Za-z0-9\_\@\(\)\#\*\\\|\{}[\]"'?/\$\!\~\,:;<>\`.=+%\^\-&]*$/.test(val)

};

const allowed_roles = ['xLSSBxAdmin', '_LSSB_user', '$Sys9'];

export let create_application = async function (reqObj, model, helpers) {


    // if (reqObj.payloadData.cloud_action == 'create_account') {}

    // console.log('creating --- -----00---- User account -===>', reqObj.payloadData );
    // console.log('create User db_set_response 00 -- 99 -===>', db_set_response );

    if (!helpers.auth$) {
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
    // if (typeof reqObj.payloadData.$required == 'undefined') {

    //     return { success: false, statusCode: 400, error: { msg: 'Missing Required parameters!' } }
    // }

    if (typeof reqObj.payloadData._fields == 'undefined') {

        return { success: false, statusCode: 400, error: { msg: 'Missing Data fields!' } }
    }

    if (!reqObj.payloadData._fields.grant_id || reqObj.payloadData._fields.grant_id == '') {

        return { success: false, statusCode: 400, error: { msg: 'missing Grant ID' } }
    }


    if (!reqObj.payloadData._fields.applicant_email || reqObj.payloadData._fields.applicant_email == '') {

        return { success: false, statusCode: 400, error: { msg: 'missing Applicant email' } }
    }

    // if (typeof reqObj.payloadData._fields.grant_status == 'closed') {

    //     return { success: false, statusCode: 400, error: { msg: 'This Application is closed' } }
    // }


    if (!reqObj.payloadData._fields.applicant_id || reqObj.payloadData._fields.applicant_id == '') {

        return { success: false, statusCode: 400, error: { msg: 'Applicant\'s profile ID required' } }
    }

    if (!reqObj.payloadData._fields.applicant_fullname || reqObj.payloadData._fields.applicant_fullname == '') {

        return { success: false, statusCode: 400, error: { msg: 'Applicant\'s Fullname required' } }
    }

    if (!reqObj.payloadData._fields.applicant_division || reqObj.payloadData._fields.applicant_division == '') {

        return { success: false, statusCode: 400, error: { msg: 'Applicant\'s Division required' } }
    }

    // if (!reqObj.payloadData._fields.username || reqObj.payloadData._fields.username == '') {

    //     return { success: false, statusCode: 400, error: { msg: 'Applicant\'s Username required' } }
    // }

    if (!reqObj.payloadData._fields.application_year || reqObj.payloadData._fields.application_year == '') {

        return { success: false, statusCode: 400, error: { msg: 'Application year required' } }
    }

    if (!reqObj.payloadData._fields.application_year_code || reqObj.payloadData._fields.application_year_code == '') {

        return { success: false, statusCode: 400, error: { msg: 'Application code year required' } }
    }

    if (!reqObj.payloadData._fields.grant_type || reqObj.payloadData._fields.grant_type == '') {

        return { success: false, statusCode: 400, error: { msg: 'Grant type required' } }
    }

    if (!reqObj.payloadData._fields.grant_type_code || reqObj.payloadData._fields.grant_type_code == '') {

        return { success: false, statusCode: 400, error: { msg: 'Grant type code required' } }
    }

    if (!reqObj.payloadData._fields.edu_level || reqObj.payloadData._fields.edu_level == '') {

        return { success: false, statusCode: 400, error: { msg: 'Education level required. values:undergraduate,masters,PHD' } }
    }

    if (!reqObj.payloadData._fields.matric_no || reqObj.payloadData._fields.matric_no == '') {

        return { success: false, statusCode: 400, error: { msg: 'Matric NO required' } }
    }




    // if (!reqObj.payloadData.$required.grant_access_mode || reqObj.payloadData.$required.grant_access_mode == '') {

    //     return { success: false, statusCode: 400, error: { msg: 'Grant Access mode required' } }
    // }


    // @@ unique id award year check
    // unique_id_grant_year: {  // prof_id+award_cat+year - For ensurin gthey only have one of this kind of aaplication for this year
    //     unique: [true, 'Application previously submitted!'],
    //     type: ['string', 'String expected for Unique'],
    //     required: [true, 'Reg ID required'], 
    // },


    // @@ check payment status for this award
    let check_payment = false;
    if (check_payment && reqObj.payloadData._fields.grant_access_mode == 'paid') {


        let db_get_response = await model.get({

            // $where: { 'postAuthor.authorId': reqObj.payloadData.byWho }, 
            // $where: { 'author': reqObj.payloadData.byWho }, 
            // author_type: reqObj.payloadData.author_type || 'profile',
            db_fn: 'check_grant_access_mode_and_pay_status',
            collection: 'LSSB_applicants',
            $skip: reqObj.payloadData.$page == 1 ? 0 : ((reqObj.payloadData.$page - 1) * $limit),
            $limit,
            // $order: 're'
            // $check_connection: { $followings: reqObj.payloadData.user_id, $followers: reqObj.payloadData.user_id } 
        });

        // let db_get_response = await helpers.LSSB_applicants_model.get({ $where: { _id: reqObj.payloadData._fields._fields.applicant_id } });


        if (db_get_response && db_get_response.msg == 'NULL') {

            return { success: false, statusCode: 404, error: { msg: 'Applicant not found.' } }
        }

        if (db_get_response && db_get_response.doc) {

            const { _invoices } = db_get_response.doc;

            if (!_invoices[reqObj.payloadData._fields.grant_type]) {

                return { success: false, statusCode: 400, error: { msg: 'Kindly make payment for this Application' } }
            }

            if (_invoices[reqObj.payloadData._fields.grant_type].pay_status !== "paid") {

                return { success: false, statusCode: 400, error: { msg: 'Payment for this Application hasn\'t been settled' } }
            }
        }
    }

    let uid = helpers.auth$.$uid$.replace(/_/g, '');

    reqObj.payloadData._fields.unique_id_grant_year_code = reqObj.payloadData._fields.applicant_id + '_' + reqObj.payloadData._fields.grant_type_code + '_' + reqObj.payloadData._fields.application_year_code;

    reqObj.payloadData._fields.application_num = 'LSSB' + reqObj.payloadData._fields.grant_type_code + reqObj.payloadData._fields.application_year_code + uid[0] + uid.slice(-3) + ("" + Date.now() + "").slice(-4);

    reqObj.payloadData._fields.application_num = reqObj.payloadData._fields.application_num.toUpperCase();

    // @@ --- for when we downgrade applicantions from Scholarship to bursary
    reqObj.payloadData._fields.initially_submitted_as = reqObj.payloadData._fields.grant_type;


    // @@ -- tie matrc to application
    reqObj.payloadData._fields.matric_grant_year = reqObj.payloadData._fields.matric_no + '+++' + reqObj.payloadData._fields.grant_type_code + '+++' + reqObj.payloadData._fields.application_year_code;

    // reqObj.payloadData._fields.unique_id_grant_year_code

    // @@ only one Matric by Student
    let thisMatric = reqObj.payloadData._fields.matric_no;

    // @@ -- refine to check for multiple later on ------- by chedking multiple exists for grant_type_codes

    let check_unique_matric_ = await model.check_exists(
        { 
            $where: { '_fields.matric_grant_year': reqObj.payloadData._fields.matric_grant_year }, 
            $return_data: true
        }
    );

    // console.log('>>>>>>>>>>> ---- check_unique_matric_  ---=>>', check_unique_matric_);

    if (check_unique_matric_ && check_unique_matric_.msg) {

        // if (check_unique_matric_.data) {

        // }

        let existing_applicant_id = check_unique_matric_.data._fields.applicant_id;

        if ( existing_applicant_id !== reqObj.payloadData._fields.application_id) {

            return { success: false, statusCode: 400, error: { msg: 'Another Applicant has applied with this matric' } }

        }

        // return { success: false, statusCode: 400, error: { msg: 'You\'ve previously applied for this Grant' } }
        // return { success: false, statusCode: 400, error: { msg: check_unique_.msg } }
    }




    // delete reqObj.payloadData._fields.grant_type_code;
    // delete reqObj.payloadData._fields.grant_type_code;

    if (reqObj.payloadData._fields.unique_id_grant_year_code) {

        // @@ -- unique check here when get is ready
        let check_unique_ = await model.check_exists({ $where: { '_fields.unique_id_grant_year_code': reqObj.payloadData._fields.unique_id_grant_year_code } });

        console.log('check_unique_ unique_id_grant_year_code ---=>>', check_unique_);

        if (check_unique_ && check_unique_.msg) {

            return { success: false, statusCode: 400, error: { msg: 'You\'ve previously applied for this Grant' } }
            // return { success: false, statusCode: 400, error: { msg: check_unique_.msg } }
        }

    }


    // @@ -======================== Encrypt Password
    // reqObj.payloadData._fields.password = helpers.Crypto.encode(reqObj.payloadData._fields.password);

    // delete reqObj.payloadData._fields.confirm_password;

    // return { success: true, statusCode: 200, data: { msg: 'Now Creating Account!'} }

    // let $uid$ = helpers.utils.generate_uid(reqObj.payloadData._fields.username || reqObj.payloadData._fields.lassra || reqObj.payloadData._fields.nin) + helpers.aNode;

    // @@ process __creator once and for all
    //  if (dataToProcess['__creator_'] && (dataToProcess['__creator_'] == 'null' || dataToProcess['__creator_'] == 'System_' || dataToProcess['__creator_'] == '$System$' )) {
    //     dataToProcess['__creator_'] = fs;
    // }
    // reqObj.payloadData['$uid$'] = $uid$;
    reqObj.payloadData['$creator$'] = helpers.auth$.$uid$;



    // @@ all Docs should have an extra for later fields
    reqObj.payloadData['$extras$'] = {};

    // reqObj.payloadData['role'] = '_LSSB_user';

    let db_set_response = await model.set({ data: reqObj.payloadData });

    console.log(' Submitting --- -----00---- Application account _uid -===>', reqObj.payloadData, '\n db_set_response --=>>>>', db_set_response);

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

        // @@ -- Update Applicant's profile with this data
        let data = {};
        let _applications = {};
        _applications[`${reqObj.payloadData._fields.grant_type}`] = {};
        let key1 = `_applications.${reqObj.payloadData._fields.grant_type}.application_num`;
        let key2 = `_applications.${reqObj.payloadData._fields.grant_type}._id`;
        let key3 = `_applications.${reqObj.payloadData._fields.grant_type}.matric_no`;

        data[key1] = reqObj.payloadData._fields.application_num;
        _applications[`${reqObj.payloadData._fields.grant_type}`].application_num = reqObj.payloadData._fields.application_num;
        _applications[`${reqObj.payloadData._fields.grant_type}`].matric_no = reqObj.payloadData._fields.matric_no;

        data[key2] = db_set_response._id;
        _applications[`${reqObj.payloadData._fields.grant_type}`]._id = db_set_response._id;

        data[key3] = reqObj.payloadData._fields.matric_no;

        // { matric_tied_to_application: ['__push', 'APPlicants_id+APPlication_num+APPlication_ID'] }
        data[`_fields.matric_tied_to_application`] = ['__push', reqObj.payloadData._fields.applicant_id + '+++' + reqObj.payloadData._fields.application_num + '+++' + reqObj.payloadData._fields.grant_type_code + '+++' + reqObj.payloadData._fields.application_year_code];

        // data[`matric_tied_to_application`][`reqObj.payloadData._fields.matric_no`] 

        let update_applicant_res = await helpers.LSSB_applicants_model.reset({

            $where: { _id: reqObj.payloadData._fields.applicant_id },
            data,
            // $updateAuthorization,//
            // $updateAuthorization: { isRole: 'xLSSBxAdmin'},
            $user$: { $uid$: helpers.auth$.$uid$, role: helpers.auth$.role }

        });

        console.log('>>>>>>  Updating Applicant --- -----00----  -===>', '\n ', update_applicant_res);

        // @@ -- 
        if (!update_applicant_res) {

            // @@ rety until we grt a response from DB
            // db_set_response = await model.set({ data:reqObj.payloadData});

            // return { success: false, statusCode: 500, error: { msg: 'Retry$' } }
            return { success: true, statusCode: 200, data: { _id: db_set_response._id, msg: 'Application Submitted', _applications, msg2: 'Error updating profile' } }
        }

        if (update_applicant_res && update_applicant_res.msg == 'DB NOT READY') {

            // return { success: false, statusCode: 500, error: { msg: 'SystemD not ready. Retry$' } }
            return { success: true, statusCode: 200, data: { _id: db_set_response._id, msg: 'Application Submitted', _applications, msg2: 'Error updating profile' } }
        }

        if (update_applicant_res && update_applicant_res.msg == 'authorized') {

            // return { success: false, statusCode: 401, error: { msg: 'Update not Permitted for User' } }
            return { success: true, statusCode: 200, data: { _id: db_set_response._id, msg: 'Application Submitted', _applications, msg2: 'Update not Permitted for User' } }
        }

        if (update_applicant_res && update_applicant_res.msg == 'OK') {

            /**   
             * @@ -- Post Set OPs
             * @@ -- Create connections collection for this post
             */


            // @@ create connections collection for this Post
            // -- should be in a GO Routine later -- 
            const worker = new Worker("/var/www/LSSB_Deploy/cp_backend/app_services/Worker/LSSB_BG_Worker.js");

            worker.postMessage({

                fnc: 'send_application_success_mail',
                data: {

                    fullname: reqObj.payloadData._fields.applicant_fullname,
                    email: reqObj.payloadData._fields.applicant_email,

                }

            });
            // -- consider memory overheads and when to just use Queue and Workers
            // await model.setup_resource_collection({ _id: update_applicant_res._id });

            return { success: true, statusCode: 200, data: { _id: db_set_response._id, msg: 'Application Submitted. Profile Updated!', _applications } }


        }


        // return { success: true, statusCode: 200, data: { token, _id: db_set_response._id, username, email, msg: 'Account Created!' } }
        // return { success: true, statusCode: 200, data: { _id: db_set_response._id, msg: 'Application Submitted', _applications } }
        return { success: true, statusCode: 200, data: { _id: db_set_response._id, msg: 'Application Submitted', _applications, msg2: 'Error updating profile' } }
    }

    return { success: false, statusCode: 500, error: { msg: 'Error submitting application!' } }
}