
export let get_user_sub_resource = async function (reqObj, model, helpers) {

    // @@ --- Allowed roles to create
    if (!helpers.auth$) {
        return { data: { msg: 'Authorization required. Kindly login!!' }, statusCode: 401, success: false };
    }

    if (typeof reqObj.auth_expires == 'number'
        && typeof helpers.auth$ == 'object' && helpers.auth$ !== null
        && typeof helpers.auth$.timeSinceIssued == 'number' &&
        auth$.timeSinceIssued > reqObj.auth_expires

    ) {

        return { data: { msg: 'Expired Authorization. Kindly login again!!' }, statusCode: 401, success: false };
    }

    // let liking_user = reqObj.payloadData['liking_user'];

    // let the_user_id = reqObj.payloadData['the_user_id'];

    // let res_to_get = reqObj.payloadData['sub_resource_type'];

    let get_user_sub_resource_res = await model.get_sub_resource({
        
        collection: `$${reqObj.payloadData['sub_resource_type']}s`,
        sub_resource_parent_collection: 'cpProfiles',
        $projection: ['fullname', '_id', 'displayPhoto'],
        $where : { _id: reqObj.payloadData['the_user_id'] }
    });

    console.log(' -->>>>>>>>>>>> get_user_sub_resource db_response -===>', get_user_sub_resource_res );

    if ( get_user_sub_resource_res && get_user_sub_resource_res.error ) {

        return { success: true, statusCode: 404, data: { msg: get_user_sub_resource_res.msg } }
    }

    if ( get_user_sub_resource_res && get_user_sub_resource_res.msg == 'OK' ) {
        
        return { success: true, statusCode: 200, data : {  msg: 'OK', docs: get_user_sub_resource_res.docs} }
    }

    return { success: false, statusCode: 500, data: { msg: 'Error getting sub_resource'} }
    
};