
// 
const allowed_roles = ['xSuperLSSBxAdmin', 'xLSSBxAdmin', '$Sys9'];

// const required_fields = [
    // 'postAuthor.displayPhoto', 'postAuthor._username'];

export let update_grant = async function ( reqObj, model, helpers ) {

    // console.log(' Update Grant ------------------------0---------0--===>', reqObj.payloadData, helpers.auth$);

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



    let capabilities_passed = false;
    // @@ check if they have necessary capability -- 
    if ( helpers.auth$.role == 'xSuperLSSBxAdmin' || ( helpers.auth$.ca && helpers.auth$.ca.indexOf('updateGrant') > -1 ) ) {

       capabilities_passed = true;
   }

   if ( !capabilities_passed ) {

       return { error: { msg: 'Not authorized to carry out this operation. Contact super admin' }, statusCode: 401, success: false };
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
    // delete reqObj.payloadData.password;

    let _id = reqObj.payloadData._id;

    delete reqObj.payloadData._id;

    let $updateAuthorization = {};

    // @@ pass
    // if ( helpers.auth$.role == 'xLSSBxAdmin' ) { // @@ -- cant add other roles
    //     $updateAuthorization['pass'] = true;
    // }

    // else {

    //     $updateAuthorization['check'] = { $creator: helpers.auth$.$uid$ };

    // }

    // allowed_roles.push('$owner$');

    let update_post_res = await model.reset({

        $where: { _id },
        data: reqObj.payloadData,
        // $updateAuthorization,
        // $updateAuthorization: { isRole: 'xLSSBxAdmin'},
        $user$: { $uid$: helpers.auth$.$uid$, role: helpers.auth$.role }

    });

    // _id: update_post_res._id
    console.log(' Updating Grant --- -----00----  -===>', 'reqObj.payloadData', '\n ', update_post_res);

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

    if ( update_post_res && update_post_res.msg == 'OK' ) {

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

    return { success: false, statusCode: 500, data: { msg: 'Error Updating Grant. Please try again!' } }



}