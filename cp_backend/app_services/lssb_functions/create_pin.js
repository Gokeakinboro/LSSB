
// 
const allowed_roles = ['xSuperLSSBxAdmin', 'xLSSBxAdmin', '$Sys9'];


export let create_pin = async function (reqObj, model, helpers) {


    // if (reqObj.payloadData.cloud_action == 'create_account') {}

    console.log('creating --- -----00---- User account -===>', helpers.auth$ );

    // console.log('create User db_set_response 00 -- 99 -===>', db_set_response );
    // @@ --- Allowed roles to create
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


    let capabilities_passed = false;
     // @@ check if they have necessary capability -- 
     if ( helpers.auth$.role == 'xSuperLSSBxAdmin' || ( helpers.auth$.ca && helpers.auth$.ca.indexOf('createPIN') > -1 ) ) {

        capabilities_passed = true;
    }

    if ( !capabilities_passed ) {

        return { error: { msg: 'Not authorized to carry out this operation. Contact super admin' }, statusCode: 401, success: false };
    }


    /**   
     * @@ -- Pre Set OPs
     */
    // if (typeof reqObj.payloadData._fields == 'undefined') {

    //     return { success: true, statusCode: 400, error: { msg: 'Data fields missing!' } }
    // }

    // if (!reqObj.payloadData._fields.grant_status  || reqObj.payloadData._fields.grant_status == '') {

    //     return { success: false, statusCode: 400, error: { msg: 'Missing grant_status. Values: closed or open' } }
    // }


    // if (!reqObj.payloadData._fields.grant_type || reqObj.payloadData._fields.grant_type == '') {

    //     return { success: false, statusCode: 400, error: { msg: 'Misssing grant_type. Values: scholarship, bursary etc..' } }

    // }

    // if (!reqObj.payloadData._fields.grant_access_mode || reqObj.payloadData._fields.grant_access_mode == '') {

    //     return { success: false, statusCode: 400, error: { msg: 'Misssing grant_access_mode. Values: free, paid etc..' } }

    // }

    // @@ email check




    // return { success: true, statusCode: 200, data: { msg: 'Now Creating Account!'} }

    // let $uid$ = helpers.utils.generate_uid(reqObj.payloadData._fields.username || reqObj.payloadData._fields.lassra || reqObj.payloadData._fields.nin) + helpers.aNode;

    // @@ process __creator once and for all
    //  if (dataToProcess['__creator_'] && (dataToProcess['__creator_'] == 'null' || dataToProcess['__creator_'] == 'System_' || dataToProcess['__creator_'] == '$System$' )) {
    //     dataToProcess['__creator_'] = fs;
    // }
    let _today = "" + Date.now();

    // return ;

    // reqObj.payloadData['$uid$'] = $uid$;
    reqObj.payloadData['$creator$'] = helpers.auth$.$uid$;

    // @@ all Docs should have an extra for later fields
    reqObj.payloadData['$extras$'] = {};


    reqObj.payloadData['_fields'] = {
        pin: "LSSB" + helpers.Crypto.encode(_today).substring(0, 12),
        created_by: helpers.auth$.$uid$,
        status: "unused",
        used_by_name: "null",
        used_by_id: "null",
    };

    // reqObj.payloadData['role'] = '_LSSB_user';
    _today = null;

    let db_set_response = await model.set({ data: reqObj.payloadData });

    console.log(' creating --- -----00---- PIN -===>', reqObj.payloadData, '\n db_set_response --=>>>>', db_set_response);

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

        // return { success: true, statusCode: 200, data: { token, _id: db_set_response._id, username, email, msg: 'Account Created!' } }
        return { success: true, statusCode: 200, data: { _id: db_set_response._id, msg: 'PIN Created!' } }
    }

    return { success: false, statusCode: 500, error: { msg: 'Error creating PIN!' } }
}