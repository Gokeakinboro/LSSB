
// 
const allowed_roles = ['xLSSBxAdmin', '_LSSB_user', '$Sys9'];


export let use_pin = async function (reqObj, model, helpers) {


    // if (reqObj.payloadData.cloud_action == 'create_account') {}

    // console.log(' Using pin --- -----00---- User account -===>', helpers.auth$);

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


    /**   
     * @@ -- Pre OPs Check
     */


    if (!reqObj.payloadData.pin || reqObj.payloadData.pin == '') {

        return { success: false, statusCode: 400, error: { msg: 'Missing PIN' } }
    }


    if (!reqObj.payloadData.users_name || reqObj.payloadData.users_name == '' || !reqObj.payloadData.users_id || reqObj.payloadData.users_id == '') {

        return { success: false, statusCode: 400, error: { msg: 'Misssing users_id, users_name' } }

    }


    // @@ check for this pin
    // @@ set-up Query Object
    let $query = {};
    $query.$where = {};

    //  reqObj.payloadData['auth_key'] = reqObj.payloadData['auth_key'].trim();

    $query.$where[`_fields.pin`] = reqObj.payloadData['pin'];

    $query.$limit = 1;

    //  $query.forAuth = true;

    $query.db_fn = 'listDocuments';

    $query.$skip = 0;

    // console.log(' $query =====================-=====-==-->', $query );

    let get_this_pin_res = await model.get($query);

    // console.log(' Auth get_this_pin_res =====================-=====-==-->', get_this_pin_res);


    if (get_this_pin_res) {


        if (get_this_pin_res.documents.length < 1) {

            return { success: false, statusCode: 400, error: { msg: `Invalid PIN` } }
        }

        let pinData = get_this_pin_res.documents[0]; //@@ first of such result

        if (pinData._fields.status !== 'unused') {

            return { success: false, statusCode: 401, error: { msg: `PIN has been used.` } }
        }

        // @@ update PIN to used by this users
        const _d = new Date();
        // options.data['$created_on$'] = _d.toISOString();

        let updatePIN_data = {
            '_fields.used_by_name': reqObj.payloadData.users_name,
            '_fields.used_by_id': reqObj.payloadData.users_id,
            '_fields.date_used': _d.toISOString(),
            '_fields.status': 'used'
        }

        // let $updateAuthorization = { pass: true };

        // @@ pass
        // if (helpers.auth$.role == 'xLSSBxAdmin') { // @@ -- cant add other roles
        //     $updateAuthorization['pass'] = true;
        // }

        // else {

        //     $updateAuthorization['check'] = { $creator: helpers.auth$.$uid$ };

        // }

        let update_pin_res = await model.reset({

            $where: { _id: pinData._id },
            data: updatePIN_data,
            $updateAuthorization: { pass: true },
            // $updateAuthorization: { isRole: 'xLSSBxAdmin'},
            $user$: { $uid$: helpers.auth$.$uid$, role: helpers.auth$.role }

        });

        // _id: update_pin_res._id
        console.log(' Updating PIN --- -----00  -===>', '\n ', update_pin_res);

        // @@ -- 
        // if (!update_pin_res) { 


        if (update_pin_res && update_pin_res.msg == 'OK') {

            /**   
             * @@ -- Post Set OPs
             * @@ -- Create connections collection for this post
             */


            return { data: { msg: 'OK' }, statusCode: 200, success: true };


        }

        // }



        return { success: false, statusCode: 500, error: { msg: 'Error validating PIN -. Try again.' } }
    }

    return { success: false, statusCode: 500, error: { msg: 'Error validating PIN. Try again.' } }


}