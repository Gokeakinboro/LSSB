

export let get_user = async function(reqObj, model ) {


    // if (reqObj.payloadData.cloud_action == 'create_account') {}


    let db_get_response = await model.get({ data:reqObj.payloadData});

    console.log('Get User db_response -===>', db_get_response );

    if ( db_get_response && db_get_response.msg == 'NULL' ) {

        return { success: true, statusCode: 404, data: { msg: 'Resource not found'} }
    }

    if ( db_get_response && db_get_response.doc ) {

        return { success: true, statusCode: 200, data: db_get_response }
    }

    return { success: false, statusCode: 500, data: { msg: 'Error Getting Doc'} }
}