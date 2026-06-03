
const allowed_roles = ['xSuperLSSBxAdmin', 'xLSSBxAdmin', '$Sys9'];

export let fetch_report = async function (reqObj, model, helpers) {


    // let byWho = reqObj.payloadData.owner == 'entity' ? '' : '';

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

    // @@ -- anyone can fetch grants
    if (!helpers.auth$.role || allowed_roles.indexOf(helpers.auth$.role) == -1) {

        return { error: { msg: 'Not allowed. Only admins permitted' }, statusCode: 401, success: false };
    }




    // reqObj.payloadData.$page = reqObj.payloadData.$page || 1;
    // let $limit = reqObj.payloadData.$items_per_page || 10

    let db_get_response = await model.get({

        // $where: { 'postAuthor.authorId': reqObj.payloadData.byWho }, 
        // $where: { 'author': reqObj.payloadData.byWho }, 
        // author_type: reqObj.payloadData.author_type || 'profile',

        db_fn: 'fetch_admin_report',
        collection: 'LSSB_admin',
        // $skip: reqObj.payloadData.$page == 1 ? 0 : ( ( reqObj.payloadData.$page - 1) * $limit),
        // $limit,
        // $order: 're'
        // $check_connection: { $followings: reqObj.payloadData.user_id, $followers: reqObj.payloadData.user_id } 
    });



    console.log(

        'Fetch Admin Report db_response -===>', 'db_get_response',
        reqObj.payloadData, '\n $check res --->>',
        //  db_get_response.check_connection_resul

    );

    // const obj = { a: 1, b: 2, c: 3, d: 4 }
    // const clone = (({ b, c, ...o }) => o)(obj) // remove b and c
    // console.log(clone)


    if ((db_get_response && db_get_response.msg == 'OK')) {

        return { success: true, statusCode: 404, data: { msg: 'OK', report: db_get_response.report } }
    }

    if (db_get_response && db_get_response.documents) {


        // https://stackoverflow.com/questions/34698905/how-can-i-clone-a-javascript-object-except-for-one-key
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment

        // const docWithProjections = (({ user_id, $extras$, $creator$, $created_on$, $last_edited_on$, $last_edited_on, $t$, _email, ...o }) => o)(db_get_response.doc) // remove b and c

        // db_get_response.documents
        return { success: true, statusCode: 200, data: { data: db_get_response.documents } }
        // return { success: true, statusCode: 200, data: { msg: 'OK', data: [{_id: 'kjhb', fullname: 'vicman', $connections$: {}, isFollowing: true, displayPhoto: 'http://localhost:3150//cpfl/2024/04/ximg8-21712666234026.jpeg' },
        //     {_id: 'kjhjnjmb', fullname: 'Dunsin', $connections$: {}, isFollowing: false, displayPhoto: 'http://localhost:3150//cpfl/2024/04/ximg111712666098553.jpg' }
        // ] } }
    }

    return { success: false, statusCode: 500, error: { msg: 'Error Fetching Admin Stats' } }


}


