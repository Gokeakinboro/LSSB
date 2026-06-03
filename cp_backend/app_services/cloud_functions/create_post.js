
// 
const allowed_roles = ['cpUser_', 'cpAdmin$', '$Sys9'];

const required_fields = [
    'postAuthor.displayPhoto', 'postAuthor._username']

export let create_post = async function (reqObj, model, helpers) {

    console.log(' create Post ------------------------0---------0--===>', reqObj.payloadData, helpers.auth$);

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

    if (!helpers.auth$.role || allowed_roles.indexOf(helpers.auth$.role) == -1) {

        return { data: { msg: 'Unauthorized Post Operation' }, statusCode: 401, success: false };
    }

    // @@ validation
    if (!reqObj.payloadData['postAuthor'] ) {

        return { data: { msg: 'Author is Required' }, statusCode: 400, success: false };

    }

    if ( !reqObj.payloadData['postAuthor'].authorId || reqObj.payloadData['postAuthor'].authorId == '' || !reqObj.payloadData['postAuthor'].fullname || !reqObj.payloadData['postAuthor']._username || reqObj.payloadData['postAuthor']._username == '' || reqObj.payloadData['postAuthor'].fullname == '' ) {

        return { data: { msg: 'Author\'s Names, Username & ID is Required' }, statusCode: 400, success: false };

    }

    if (!reqObj.payloadData['postAuthor'].displayPhoto || reqObj.payloadData['postAuthor'].displayPhoto == 'null.jpg') {

        return { data: { msg: ' Author Display Photo is Required' }, statusCode: 400, success: false };

    }

    // if (!reqObj.payloadData['user_id'] || reqObj.payloadData['user_id'] == 'null') {

    //     return { data: { msg: 'Kindly Specify User ID' }, statusCode: 400, success: false };

    // }

    // @@ set some necessary keys

    reqObj.payloadData['$creator$'] = helpers.auth$.$uid$;

    // @@ all Docs should have an extra for later fields
    reqObj.payloadData['$extras$'] = {};

    // @@ connections for this item
    reqObj.payloadData['$connections$'] = {};

    // @@ process dot keys in payLoad e.g _fields._sex
    Object.keys(reqObj.payloadData).forEach(k => {

        // console.log('k --->  k  --->', k);

        if (k.indexOf('.') > -1) {

            // console.log('k --->  k  --->', k);
            let a = k.split('.');

            reqObj.payloadData[a[0]] = reqObj.payloadData[a[0]] || {};

            reqObj.payloadData[a[0]][a[1]] = reqObj.payloadData[k];

            delete reqObj.payloadData[k];

            // console.log('a --->  k  --->', a);

        }

    });

    // return { data: { msg: 'Post Created' }, statusCode: 200, success: true };

    let create_post_res = await model.set({ data: reqObj.payloadData });

    // _id: create_post_res._id
    console.log(' creating --- -----00---- Post  -===>', reqObj.payloadData, '\n create_post_res --=>>>>', create_post_res);

    // @@ -- 
    if (!create_post_res) {

        // @@ rety until we grt a response from DB
        // db_set_response = await model.set({ data:reqObj.payloadData});

        return { success: false, statusCode: 500, data: { msg: 'Retry$' } }
    }

    if (create_post_res && create_post_res.msg == 'DB NOT READY') {

        return { success: false, statusCode: 500, data: { msg: 'SystemD not ready. Retry$' } }
    }

    if (create_post_res && create_post_res.msg == 'OK') {

        /**   
         * @@ -- Post Set OPs
         * @@ -- Create connections collection for this post
         */

        // @@ create connections collection for this Post
        // -- should be in a GO Routine later -- 
        // -- consider memory overheads and when to just use Queue and Workers
        // await model.setup_resource_collection({ _id: create_post_res._id });

        return { data: { msg: 'Post Created', _id: create_post_res._id }, statusCode: 200, success: true };

        
    }

    return { success: false, statusCode: 500, data: { msg: 'Error creating Post. Please try again!' } }



}