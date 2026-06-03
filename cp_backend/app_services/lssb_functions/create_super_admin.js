
// 
const validate_uname = function (val) {

    // console.log('val username --=>', /^[A-Za-z_0-9]*$/.test(val), val);

    return /^[a-zA-Z0-9_]+$/.test(val);

}

const validate_password = function (val) {


    return /^[A-Za-z0-9\_\@\(\)\#\*\\\|\{}[\]"'?/\$\!\~\,:;<>\`.=+%\^\-&]*$/.test(val)

};

export let create_super_admin = async function (reqObj, model, helpers) {


    // if (reqObj.payloadData.cloud_action == 'create_account') {}

    // console.log('creating --- -----00---- User account -===>', reqObj.payloadData );

    // console.log('create User db_set_response 00 -- 99 -===>', db_set_response );

    /**   
     * @@ -- Pre Set OPs
     */
    if (typeof reqObj.payloadData._fields == 'undefined') {

        return { success: true, statusCode: 400, error: { msg: 'No data field provided' } }
    }

    if ( reqObj.payloadData._fields.role || reqObj.payloadData.role ) {

        return { success: false, statusCode: 400, error: { msg: 'Role not allowed in payload' } }

    }

    if ( !reqObj.payloadData._fields.email || reqObj.payloadData._fields.email == '' ) {

        return { success: false, statusCode: 400, error: { msg: 'Email required!' } }

    }

    if ( !validate_uname(reqObj.payloadData._fields.username) ) {

        return { success: false, statusCode: 400, error: { msg: 'Only letters, numbers and \n underscore allowed for Username' } }

    }

    if ( !validate_password(reqObj.payloadData._fields.password) ) {

        return { success: false, statusCode: 400, error: { msg: 'unallowed character in password' } }

    }

    // @@ -======================== 'matching Pass': [ { 'password': 'confirm_password' } ]
    if (reqObj.payloadData._fields.password !== reqObj.payloadData._fields.confirm_password) {

        return { success: false, statusCode: 400, error: { msg: 'Passwords do not match!' } }

    };



    reqObj.payloadData._fields.email = reqObj.payloadData._fields.email.trim().toLowerCase();
    reqObj.payloadData._fields.username = reqObj.payloadData._fields.username.trim().toLowerCase();

    // @@ email check

    if (reqObj.payloadData._fields.email) {

        // @@ -- unique check here when get is ready
        let check_unique_email = await model.check_exists({ $where: { '_fields.email': reqObj.payloadData._fields.email } });

        console.log( 'check_unique_email ---=>>', check_unique_email );

        if (check_unique_email && check_unique_email.msg) {

            //  return { success: true, statusCode: 400, data: { msg: 'Email already exists'} }
            return { success: false, statusCode: 400, error: { msg: 'Email already exists'} }
        }

    }


    // @@ -======================== Encrypt Password
    // reqObj.payloadData._fields.password = helpers.Crypto.encode(reqObj.payloadData._fields.password);

    reqObj.payloadData.$password$ = helpers.Crypto.encode(reqObj.payloadData._fields.password);

    delete reqObj.payloadData._fields.confirm_password;
    delete reqObj.payloadData._fields.password;

    // @@ -- 'generate_uid': 'username',

   

    // @@ -- unique check here when get is ready
    let check_unique_username = await model.check_exists({ $where: { '_fields.username': reqObj.payloadData._fields.username } });

    // console.log(' check_unique_username ---=>>', check_unique_username);

    if (check_unique_username && check_unique_username.msg) {

        return { success: false, statusCode: 400, error: { msg: 'Username already exists' } }
    }


    // return { success: true, statusCode: 200, data: { msg: 'Now Creating Account!'} }

    let $uid$ = helpers.utils.generate_uid(reqObj.payloadData._fields.username) + helpers.aNode;

    // @@ process __creator once and for all
    //  if (dataToProcess['__creator_'] && (dataToProcess['__creator_'] == 'null' || dataToProcess['__creator_'] == 'System_' || dataToProcess['__creator_'] == '$System$' )) {
    //     dataToProcess['__creator_'] = fs;
    // }
    reqObj.payloadData['$uid$'] = $uid$;
    reqObj.payloadData['$creator$'] = $uid$;

    // @@ all Docs should have an extra for later fields
    reqObj.payloadData['$extras$'] = {};

    reqObj.payloadData['role'] = 'xSuperLSSBxAdmin';

    reqObj.payloadData['capabilities'] = ['all'];

    // 'createGrant': 'Create Grant',
    // 'deleteGrant': 'Delete Grant',
    // 'updateGrant': 'Update Grant',

    let db_set_response = await model.set({ data: reqObj.payloadData });

    console.log(' creating --- -----00---- Super Admin account _uid -===>', reqObj.payloadData, '\n db_set_response --=>>>>', db_set_response);

    // @@ -- 'encrypt_data_keys': 'password',

    // return { success: true, statusCode: 200, data: { msg: 'Now Creating Account!'} }

    if (!db_set_response) {

        // @@ rety until we grt a response from DB
        // db_set_response = await model.set({ data:reqObj.payloadData});

        return { success: false, statusCode: 500, error: { msg: 'Retry$' } }
    }

    if (db_set_response && db_set_response.msg == 'DB NOT READY') {

        return { success: false, statusCode: 500, error: { msg: 'SystemD not ready. Retry$' } }
    }

    if (db_set_response && db_set_response.msg == 'OK') {


        /**   
         * @@ -- Post Set OPs
         */

        // @@ -======================== 'matching_values': [ { 'password': 'confirm_password' } ]
        // post_set_ops_: {
        //     'generate_encrypted_data': { 'token': ['$uid$', 'role'] },
        // },
        const { role } = reqObj.payloadData;
        const { username, email } = reqObj.payloadData._fields;

        let token = helpers.Crypto.encode_token({ $uid$, role, _id: db_set_response._id, ca:'all' });

        // displayPhoto: 'user.png'

        return { success: true, statusCode: 200, data: { token, _id: db_set_response._id, username, email, msg: 'Account Created!' } }
    }

    return { success: false, statusCode: 500, error: { msg: 'Error creating Super Admin!' } }
}