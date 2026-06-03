
// 

export let user_create_account = async function(reqObj, model, helpers ) {


    // if (reqObj.payloadData.cloud_action == 'create_account') {}

    // console.log('creating User account -===>', reqObj.payloadData );

    let db_set_response = await model.set({ data:reqObj.payloadData});

    console.log('create User db_set_response 00 -- 99 -===>', db_set_response );
    
    if ( !db_set_response ) {
        
        // @@ rety until we grt a response from DB
        // db_set_response = await model.set({ data:reqObj.payloadData});

        return { success: false, statusCode: 500, data: { msg: 'Retry$'} }
    }

    if ( db_set_response && db_set_response.msg == 'DB NOT READY') {

        return { success: false, statusCode: 500, data: { msg: 'SystemD not ready. Retry$'} }
    }

    if ( db_set_response && db_set_response.msg == 'OK') {

        return { success: true, statusCode: 200, data: { msg: 'Account Created!'} }
    }

    return { success: false, statusCode: 500, data: { msg: 'Error creating account!'} }
}