
// 
const allowed_roles = ['xSuperLSSBxAdmin', 'xLSSBxAdmin', '_LSSB_user', '$Sys9'];

const protected_fields = [
    '_fields.grant_access_mode', '_fields.grant_id', '_fields.applicant_id', '_fields.grant_type', '_fields.grant_type_code', '_fields.grant_name', '_fields.edu_level'
];

export let update_application = async function (reqObj, model, helpers) {

    console.log(' Update Applicant ------------------------0---------0--===>', reqObj.payloadData, helpers.auth$);

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

        return { error: { msg: 'Unauthorized Update Request' }, statusCode: 401, success: false };
    }

    // @@ validation -- == --- ==== >>>>-->>>> 
    // if (!reqObj.payloadData['postAuthor'] ) {

    //     return { data: { msg: 'Author is Required' }, statusCode: 400, success: false };

    // }

    // @@ set some necessary keys

    // reqObj.payloadData['$creator$'] = helpers.auth$.$uid$;

    // @@ all Docs should have an extra for later fields
    // reqObj.payloadData['$extras$'] = {};

    // @@ connections for this item
    // reqObj.payloadData['$connections$'] = {};

    // @@ process dot keys in payLoad e.g _fields._sex
    // Object.keys(reqObj.payloadData).forEach(k => {

    //     // console.log('k --->  k  --->', k);

    //     if (k.indexOf('.') > -1) {

    //         // console.log('k --->  k  --->', k);
    //         let a = k.split('.');

    //         reqObj.payloadData[a[0]] = reqObj.payloadData[a[0]] || {};

    //         reqObj.payloadData[a[0]][a[1]] = reqObj.payloadData[k];

    //         delete reqObj.payloadData[k];

    //         // console.log('a --->  k  --->', a);

    //     }

    // });

    // return { data: { msg: 'Post Created' }, statusCode: 200, success: true };

    // delete reqObj.payloadData.post_id;
    // @@ password can't just be update here --===
    delete reqObj.payloadData.password;

    let _id = reqObj.payloadData._id;

    delete reqObj.payloadData._id;
    delete reqObj.payloadData.$k;

    let $updateAuthorization = {};

    // @@ pass
    if (helpers.auth$.role == 'xLSSBxAdmin' || helpers.auth$.role == 'xSuperLSSBxAdmin') { // @@ -- cant add other roles
        $updateAuthorization['pass'] = true;
    }

    else {

        $updateAuthorization['check'] = { $creator: helpers.auth$.$uid$ };

    }

    let bad_true = false;
    let bad_key = '';


    // @@ extra auth validation
    Object.keys(reqObj.payloadData).forEach(k => {

        if (bad_true) {
            return
        }

        // console.log('auth k ----->', k, k.indexOf('undefined') > -1, auth$[k].indexOf('undefined') > -1);

        if ( protected_fields.indexOf(k) > -1 ) {

            bad_true = true;
            bad_key = k;
        }
    })

    if (bad_true &&  reqObj.payloadData['updateAuth'] == 'from_staff') {
        bad_true = false;
        delete reqObj.payloadData['updateAuth'];

    }

    if (bad_true) {
        return { success: false, statusCode: 400, error: { msg: `Updating ${bad_key} not allowed` } }
    }

    // allowed_roles.push('$owner$');

    // Auto-update application_status when approval fields change
    const approvalMap = {
        '_fields.Es_approval': { 'Approved': 'ES Approved', 'Rejected': 'ES Rejected' },
        '_fields.Pass_approval': { 'Approved': 'Pass Approved', 'Rejected': 'Pass Rejected' },
        '_fields.Audit_approval': { 'Approved': 'Audit Approved', 'Rejected': 'Audit Rejected' },
        '_fields.Finance_approval': { 'Approved': 'Finance Approved', 'Rejected': 'Finance Rejected' },
    };
    for (const [field, statusMap] of Object.entries(approvalMap)) {
        if (reqObj.payloadData[field] && statusMap[reqObj.payloadData[field]]) {
            reqObj.payloadData['_fields.application_status'] = statusMap[reqObj.payloadData[field]];
            break;
        }
    }

    let update_post_res = await model.reset({

        $where: { _id },
        data: reqObj.payloadData,
        $updateAuthorization,
        // $updateAuthorization: { isRole: 'xLSSBxAdmin'},
        $user$: { $uid$: helpers.auth$.$uid$, role: helpers.auth$.role }

    });

   

    // _id: update_post_res._id
    console.log(' Updating Applicant --- -----00---- Application  -===>', 'reqObj.payloadData', '\n ', update_post_res);

    

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

    if ( update_post_res && update_post_res.msg == "Missing ID" ) {

        return { success: false, statusCode: 400, error: { msg: 'Missing resource ID' } }
    }

    if (update_post_res && update_post_res.msg == 'OK') {

        /**   
         * @@ -- Post Set OPs
         * @@ -- Create connections collection for this post
         */


        // @@ create connections collection for this Post
        // -- should be in a GO Routine later -- 
        // -- consider memory overheads and when to just use Queue and Workers
        // await model.setup_resource_collection({ _id: update_post_res._id });

        return { data: { msg: 'Update Successfull' }, statusCode: 200, success: true };


    }

    return { success: false, statusCode: 500, data: { msg: 'Error Updating Application. Please try again!' } }



}