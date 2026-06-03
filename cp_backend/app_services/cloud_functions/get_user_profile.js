
// 

export let get_user_profile = async function (reqObj, model, helpers) {


    // if (reqObj.payloadData.cloud_action == 'create_account') {}


    if (reqObj.payloadData.type == 'self') {

        // @@ -- gettting other users profile
        // -- check appropriate Auth
        { $where: { _id: reqObj.$query.$where._id } }

        let db_get_response = await model.get(reqObj.$query);

        // console.log('Get User Profile db_response -===>', db_get_response, reqObj.payloadData, reqObj.$query, helpers.auth$);

        if (db_get_response && db_get_response.doc._id) {

            if (db_get_response.doc.$creator$ == helpers.auth$.$uid$) {

                return { success: true, statusCode: 200, data: { msg: 'OK', doc:db_get_response.doc } }

            }

            return { success: false, statusCode: 401, data: { msg: 'Unauthorized Request!' } }




        }


        return { success: true, statusCode: 404, data: { msg: 'Profile not found' } }

    }

    // @@ -- gettting other users profile
    // -- check appropriate Auth
    let db_get_response = await model.get({ data: reqObj.payloadData });

    console.log('Get User Profile db_response -===>', db_get_response);

    if (db_get_response && db_get_response.msg == 'NULL') {

        return { success: true, statusCode: 404, data: { msg: 'Resource not found' } }
    }

    if (db_get_response && db_get_response.doc) {

        return { success: true, statusCode: 200, data: db_get_response }
    }

    return { success: false, statusCode: 500, data: { msg: 'Error Getting Doc' } }
}