
// 

export let create_user_account = async function(reqObj, model, helpers ) {


    // if (reqObj.payloadData.cloud_action == 'create_account') {}

    // console.log('creating --- -----00---- User account -===>', reqObj.payloadData );

    // console.log('create User db_set_response 00 -- 99 -===>', db_set_response );

    /**   
	 * @@ -- Pre Set OPs
	 */
    
    // @@ -======================== 'matching Pass': [ { '_password': '_confirm_password' } ]
    if ( reqObj.payloadData._password !==  reqObj.payloadData._confirm_password) {

        return { success: true, statusCode: 400, data: { msg: 'Passwords do not match!'} }

    };

    // @@ email check
     // @@ -- unique check here when get is ready
     let check_unique_email = await model.check_exists({ $where:{ _username: reqObj.payloadData._email } });

     console.log('check_unique_username ---=>>', check_unique_email );
 
     if ( check_unique_email && check_unique_email.msg ) {
 
        //  return { success: true, statusCode: 400, data: { msg: 'Email already exists'} }
        return { success: true, statusCode: 400, data: { msg: check_unique_email.msg } }
     }

    // @@ -======================== Encrypt Password
    reqObj.payloadData._password = helpers.Crypto.encode(reqObj.payloadData._password);

    delete reqObj.payloadData._confirm_password;

    // @@ -- 'generate_uid': '_username',
    reqObj.payloadData._username = reqObj.payloadData._username.trim();

    // @@ -- unique check here when get is ready
    let check_unique_username = await model.check_exists({ $where:{ _username: reqObj.payloadData._username } });

    console.log('check_unique_username ---=>>', check_unique_username );

    if ( check_unique_username && check_unique_username.msg ) {

        return { success: true, statusCode: 400, data: { msg: 'Username already exists'} }
    }
    

    // return { success: true, statusCode: 200, data: { msg: 'Now Creating Account!'} }

    let $uid$ = helpers.utils.generate_uid(reqObj.payloadData._username) + helpers.aNode;

     // @@ process __creator once and for all
    //  if (dataToProcess['__creator_'] && (dataToProcess['__creator_'] == 'null' || dataToProcess['__creator_'] == 'System_' || dataToProcess['__creator_'] == '$System$' )) {
    //     dataToProcess['__creator_'] = fs;
    // }
    reqObj.payloadData['$uid$'] = $uid$;
    reqObj.payloadData['$creator$'] = $uid$;

    // @@ all Docs should have an extra for later fields
    reqObj.payloadData['$extras$'] = {};

    reqObj.payloadData['role'] = 'cpUser_';

    let db_set_response = await model.set({ data:reqObj.payloadData});

    console.log( ' creating --- -----00---- User account _uid -===>', reqObj.payloadData, '\n db_set_response --=>>>>', db_set_response );

    // @@ -- 'encrypt_data_keys': '_password',

    // return { success: true, statusCode: 200, data: { msg: 'Now Creating Account!'} }
    
    if ( !db_set_response ) {
        
        // @@ rety until we grt a response from DB
        // db_set_response = await model.set({ data:reqObj.payloadData});

        return { success: false, statusCode: 500, data: { msg: 'Retry$'} }
    }

    if ( db_set_response && db_set_response.msg == 'DB NOT READY') {

        return { success: false, statusCode: 500, data: { msg: 'SystemD not ready. Retry$'} }
    }

    if ( db_set_response && db_set_response.msg == 'OK') {



        /**   
         * @@ -- Post Set OPs
         */

        // @@ -======================== 'matching_values': [ { '_password': '_confirm_password' } ]
        // post_set_ops_: {
        //     'generate_encrypted_data': { 'token': ['$uid$', 'role'] },
        // },
        const { _username, role, _email } = reqObj.payloadData;

        let token = helpers.Crypto.encode_token({ $uid$, role });

        return { success: true, statusCode: 200, data: { token, _id: db_set_response._id, _username, _email, displayPhoto: 'user.png', msg: 'Account Created!'} }
    }

    return { success: false, statusCode: 500, data: { msg: 'Error creating account!'} }
}