
const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

export let fetch_discover_feed = async function (reqObj, model, helpers) {


    // let byWho = reqObj.payloadData.owner == 'entity' ? '' : '';
    // let db_get_response = await model.get

    let db_get_response = await model.get({ 

        $limit: 6,
        $where: { _id: reqObj.payloadData.user }, 
        db_fn: 'get_discover_feed',
        // $page: reqObj.payloadData.$page == 0 ? 0 : (reqObj.payloadData.$page * 6),
        $page: reqObj.payloadData.$page,
        
        // $check_connection: { $followings: reqObj.payloadData.user_id, $followers: reqObj.payloadData.user_id } 
    });

    

    // const obj = { a: 1, b: 2, c: 3, d: 4 }
    // const clone = (({ b, c, ...o }) => o)(obj) // remove b and c
    // console.log(clone)


    if ( (db_get_response && db_get_response.msg == 'NULL') ) {

        return { success: true, statusCode: 404, data: { msg: 'Null' } }
    }

    console.log( 

        'Get Discover feed -===>', 'db_get_response', 
       //  reqObj.payloadData, '\n $check res --->>', 
        db_get_response.discover_feed.length

   );

    if (db_get_response && db_get_response.discover_feed ) {

        db_get_response.discover_feed = shuffle(db_get_response.discover_feed);


        // https://stackoverflow.com/questions/34698905/how-can-i-clone-a-javascript-object-except-for-one-key
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment

        // const docWithProjections = (({ user_id, $extras$, $creator$, $created_on$, $last_edited_on$, $last_edited_on, $t$, _email, ...o }) => o)(db_get_response.doc) // remove b and c

        // further 
        // delete docWithProjections._fields.phone_no;
        return { success: true, statusCode: 200, data: { msg: 'OK', data: db_get_response.discover_feed } }

        // @@ add connections 
        // docWithProjections.isFollowing = db_get_response.check_connection_result.$followings;
        // docWithProjections.isFollower = db_get_response.check_connection_result.$followers;

        // db_get_response.documents
        // return { success: true, statusCode: 200, data: { msg: 'OK', data: [{_id: 'kjhb', fullname: 'vicman', $connections$: {}, isFollowing: true, displayPhoto: 'http://localhost:3150//cpfl/2024/04/ximg8-21712666234026.jpeg' },
        //     {_id: 'kjhjnjmb', fullname: 'Dunsin', $connections$: {}, isFollowing: false, displayPhoto: 'http://localhost:3150//cpfl/2024/04/ximg111712666098553.jpg' }
        // ] } }
    }

    return { success: false, statusCode: 500, data: { msg: 'Error Fetching' } }


}