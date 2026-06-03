
const { date_ranger } = await import('../_lib_/date_ranger.js');

const allowed_roles = ['xLSSBxAdmin', '$Sys9'];

export let fetch_grants = async function (reqObj, model, helpers) {


    // let byWho = reqObj.payloadData.owner == 'entity' ? '' : '';

    // console.log(' 0 Where now :: ->', '$where' );

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

    // @@ single Fetch by _id
    if (reqObj.payloadData.$where && reqObj.payloadData.$where._id) {


        let db_get_response = await model.get({

            // $where: { _id: reqObj.payloadData.$where._id }, 
            $where: reqObj.payloadData.$where,
        });



        // console.log(

        //     'Get 1 Grant db_response -===>', 'db_get_response',
        //     reqObj.payloadData, '\n $check res --->>',
        //     //  db_get_response.check_connection_resul
        //     db_get_response

        // );

        // const obj = { a: 1, b: 2, c: 3, d: 4 }
        // const clone = (({ b, c, ...o }) => o)(obj) // remove b and c
        // console.log(clone)


        if ((db_get_response && db_get_response.msg == 'NULL')) {

            return { success: false, statusCode: 404, error: { msg: 'Null' } }
        }

        if (db_get_response && db_get_response.doc) {


            delete db_get_response.doc.$creator$;
            delete db_get_response.doc.$last_edited_on$;
            delete db_get_response.doc.$t$;

            // db_get_response.documents
            return { success: true, statusCode: 200, data: { data: db_get_response.doc } }

        }

        return { success: false, statusCode: 500, error: { msg: 'Error Fetching' } }

    }


    // @@ process where clauses
    let _p_where = reqObj.payloadData.$where || {};
    let $where = {};

    Object.keys(_p_where).forEach(where_clause => {

        if (where_clause !== '_id' && _p_where[where_clause] !== '') {
            $where[where_clause] = _p_where[where_clause];
        }

    });


    // console.log('Where now :: ->', $where );

    _p_where = null;

    let $startDate = reqObj.payloadData.$startDate;

    reqObj.payloadData.$page = reqObj.payloadData.$page || 1;
    let $limit = reqObj.payloadData.$items_per_page || 10;

    let $where_not = reqObj.payloadData.$where_not || {};
    let $search = reqObj.payloadData.$search || {};
    let $date_range = [];

    if (reqObj.payloadData.$where && reqObj.payloadData.$where._id) {

        reqObj.payloadData.$page = 1;
        $limit = 1;
    }

    if (typeof $date_range !== 'object' || typeof $date_range.length !== 'number') {

        return { success: false, statusCode: 400, error: { msg: 'Date range must be Array' } }
    }

    let $date_ranger = { allow: false, };
    if ($startDate) {

        $date_range.push($startDate);
        reqObj.payloadData.$endDate && $date_range.push(reqObj.payloadData.$endDate);

        let dr = date_ranger($date_range);

        if (dr.error) {

            return { success: false, statusCode: 400, error: { msg: dr.error } }
        }

        $date_ranger.range = dr.date_str;
        $date_ranger.allow = true;

    }

    // dr

    // console.log(' reqObj.payloadData.$date_range, --->',  reqObj.payloadData.$date_range, 'dr :: ->', 'dr' );

    let db_get_response = await model.get({

        // $where: { 'postAuthor.authorId': reqObj.payloadData.byWho }, 
        // $where: { 'author': reqObj.payloadData.byWho }, 
        // author_type: reqObj.payloadData.author_type || 'profile',
        $where,
        $search,
        $where_not,
        $date_ranger,
        db_fn: 'listDocuments',
        collection: 'LSSB_grants',
        $skip: reqObj.payloadData.$page == 1 ? 0 : ((reqObj.payloadData.$page - 1) * $limit),
        $limit,
        // $order: 're'
        // $check_connection: { $followings: reqObj.payloadData.user_id, $followers: reqObj.payloadData.user_id } 
    });



    // console.log(

    //     'Get Grants  --many -- db_response -===>', 'db_get_response',
    //     reqObj.payloadData, '\n $check res --->>',
    //     db_get_response

    // );

    // const obj = { a: 1, b: 2, c: 3, d: 4 }
    // const clone = (({ b, c, ...o }) => o)(obj) // remove b and c
    // console.log(clone)


    if ((db_get_response && db_get_response.msg == 'NULL')) {

        return { success: true, statusCode: 404, data: { msg: 'Null' } }
    }

    if (db_get_response && db_get_response.documents) {


        // https://stackoverflow.com/questions/34698905/how-can-i-clone-a-javascript-object-except-for-one-key
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment

        // const docWithProjections = (({ user_id, $extras$, $creator$, $created_on$, $last_edited_on$, $last_edited_on, $t$, _email, ...o }) => o)(db_get_response.doc) // remove b and c

        // further 
        // delete docWithProjections._fields.phone_no;

        // @@ add connections 
        // docWithProjections.isFollowing = db_get_response.check_connection_result.$followings;
        // docWithProjections.isFollower = db_get_response.check_connection_result.$followers;

        // db_get_response.documents
        return { success: true, statusCode: 200, data: { data: db_get_response.documents } }
        // return { success: true, statusCode: 200, data: { msg: 'OK', data: [{_id: 'kjhb', fullname: 'vicman', $connections$: {}, isFollowing: true, displayPhoto: 'http://localhost:3150//cpfl/2024/04/ximg8-21712666234026.jpeg' },
        //     {_id: 'kjhjnjmb', fullname: 'Dunsin', $connections$: {}, isFollowing: false, displayPhoto: 'http://localhost:3150//cpfl/2024/04/ximg111712666098553.jpg' }
        // ] } }
    }

    return { success: false, statusCode: 500, error: { msg: 'Error Fetching' } }


}


