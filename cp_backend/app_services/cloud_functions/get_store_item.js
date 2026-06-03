export let get_store_item = async function (reqObj, model, helpers) {



    let db_get_response = await model.get(
        { $where: reqObj.payloadData.$where, 
            $join: {
                key: 'authorId',
                collection: 'cpProfiles',
                projections: []
            }
        });

    console.log('Get Store Items db_response -===>', db_get_response, reqObj.payloadData, '\n $check res --->>', db_get_response.check_connection_result);

    // const obj = { a: 1, b: 2, c: 3, d: 4 }
    // const clone = (({ b, c, ...o }) => o)(obj) // remove b and c
    // console.log(clone);


    if (db_get_response && db_get_response.msg == 'NULL') {

        return { success: true, statusCode: 404, data: { msg: 'Null' } }
    }

    if (db_get_response && db_get_response.doc) {


        // https://stackoverflow.com/questions/34698905/how-can-i-clone-a-javascript-object-except-for-one-key
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment

        const docWithProjections = (({ $extras$, $creator$, $created_on$, $last_edited_on$, $last_edited_on, $t$, ...o }) => o)(db_get_response.doc) // remove b and c

        // further 
        // delete docWithProjections._fields.phone_no;

        // @@ add connections 
        // docWithProjections.isFollowing = db_get_response.check_connection_result.$followings;
        // docWithProjections.isFollower = db_get_response.check_connection_result.$followers;


        return { success: true, statusCode: 200, data: { msg: 'OK', data: docWithProjections } }
    }

    return { success: false, statusCode: 500, data: { msg: 'Error Fetching' } }


}