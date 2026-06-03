
// 
const allowed_roles = ['xSuperLSSBxAdmin', 'xLSSBxAdmin', '$Sys9'];


export let delete_pin = async function (reqObj, model, helpers) {


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


    let capabilities_passed = false;
     // @@ check if they have necessary capability -- 
     if ( helpers.auth$.role !== 'xSuperLSSBxAdmin' || ( helpers.auth$.ca && helpers.auth$.ca.indexOf('deletePIN') > -1 ) ) {

        capabilities_passed = true;
    }

    if ( !capabilities_passed ) {

        return { error: { msg: 'Not authorized to carry out this operation. Contact super admin' }, statusCode: 401, success: false };
    }


    /**   
     * @@ -- Pre OPs Check
     */


    if (!reqObj.payloadData._id || reqObj.payloadData._id == '') {

        return { success: false, statusCode: 400, error: { msg: 'Missing resource ID' } }
    }



    // @@ check for this pin
    // @@ set-up Query Object
    let $query = {};
    $query.$where = {};

    //  reqObj.payloadData['auth_key'] = reqObj.payloadData['auth_key'].trim();

    $query.$where[`_id`] = reqObj.payloadData['_id'];


    // console.log(' $query =====================-=====-==-->', $query );
    

    let delete_this_pin_res = await model.unset($query);

    console.log('  delete_this_pin_res =====================-=====-==-->', delete_this_pin_res);

    // return { data: { msg: 'OK' }, statusCode: 200, success: true };

    if (delete_this_pin_res && delete_this_pin_res.msg == "Doc not found") {

        return { error: { msg: 'PIN not found' }, statusCode: 200, success: false };

    }

    if (delete_this_pin_res && delete_this_pin_res.msg == "OK") {

        /**   
         * @@ -- Post Set OPs
         * @@ -- Create connections collection for this post
         */

        return { data: { msg: 'OK' }, statusCode: 200, success: true };


    }

    return { success: false, statusCode: 500, error: { msg: 'Error deleting PIN. Try again.' } }


}