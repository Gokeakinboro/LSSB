
// 
const allowed_roles = ['cpUser_', 'cpAdmin$', '$Sys9'];

const required_fields = [
    '_fields._sex', '_fields._dob', '_fields.country', 'displayPhoto', '_username', 'user_id']

export let create_store_item = async function (reqObj, model, helpers) {

    console.log(' create Entity ------------------------0---------0--===>', reqObj.payloadData, helpers.auth$);

    // @@ --- Allowed roles to create
    if (!helpers.auth$.role || allowed_roles.indexOf(helpers.auth$.role) == -1) {

        return { data: { msg: 'Unauthorized Operation' }, statusCode: 401, success: false };
    }

    // @@ validation
    // if (!reqObj.payloadData['_fields'] ) {

    //     return { data: { msg: 'Kindly fill-in required fields' }, statusCode: 400, success: false };

    // }

    if (!reqObj.payloadData['_fields.name'] || reqObj.payloadData['_fields.name'] == 'null') {

        return { data: { msg: 'Item name is required' }, statusCode: 400, success: false };

    }

    if (!reqObj.payloadData['_fields.price'] || reqObj.payloadData['_fields.price'] == 'null') {

        return { data: { msg: 'Enter Item Price' }, statusCode: 400, success: false };

    }

    // if (!reqObj.payloadData['$managers'] || reqObj.payloadData['$managers'] == 'null') {

    //     return { data: { msg: 'At least one manager is required' }, statusCode: 400, success: false };

    // }

    // @@ -- unique check here when get is ready
    // let check_unique_entity_title = await model.check_exists({ $where: { user_id: reqObj.payloadData.user_id } });

    // console.log('check_unique_entity_title ---=>>', check_unique_entity_title);

    // if (check_unique_entity_title && check_unique_entity_title.msg) {


    //     let update_management_on_managing_useer = await helpers.cp_profiles_model.reset({

    //         $where: { _id: reqObj.payloadData.user_id },
    //         // authorizedRoles: '$$cpSystem$$',
    //         // data: { verified: 'true'},
    //         data: {
    //             'isProfileComplete': 'true',
    //             'firstname': reqObj.payloadData['firstname'].trim(),
    //             'profileId': check_unique_entity_title._id
    //         },
    //         $user$: { $uid$: helpers.auth$.$uid$, role: helpers.auth$ }

    //     });

    //     // console.log(' 83 update_management_on_managing_useer in check exist -=======----->>>', update_management_on_managing_useer);

    //     // @@ else 
    //     if (update_management_on_managing_useer !== 'OK') {

    //         return { data: { msg: 'Error setting-up profile' }, statusCode: 500, success: false };
    //     }

    //     // let _d = { token, _username, _r: _role, _u_token, made_pay_, msg: 'Sign-in Successfull' };
    //     return { data: { msg: 'Profile set-up Successfull', _id: check_unique_entity_title._id }, statusCode: 200, success: true };

    //     // return { success: false, statusCode: 400, data: { msg: 'User with this Profile already exists' } }
    // }


    // @@ set some necessary keys

    reqObj.payloadData['$creator$'] = helpers.auth$.$uid$;

    // @@ all Docs should have an extra for later fields
    reqObj.payloadData['$extras$'] = {};

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

    // managers

    // return { success: false, statusCode: 400, data: { msg: 'Retry$' } }

    let create_store_item_res = await model.set({ data: reqObj.payloadData });

    console.log(' creating --- -----00---- Entity  -===>', reqObj.payloadData, '\n create_store_item_res --=>>>>', create_store_item_res);

    // @@ -- 
    if (!create_store_item_res) {

        // @@ rety until we grt a response from DB
        // db_set_response = await model.set({ data:reqObj.payloadData});
        return { success: false, statusCode: 500, data: { msg: 'Retry$' } }
    }

    if (create_store_item_res && create_store_item_res.msg == 'DB NOT READY') {

        return { success: false, statusCode: 500, data: { msg: 'SystemD not ready. Retry$' } }
    }

    if (create_store_item_res && create_store_item_res.msg == 'OK') {

        /**   
         * @@ -- Post Set OPs
         * @@ -- Update users model --- set managing so we know what they manage
         */
        // koko

        // console.log('Toker rev ---->', token, ' --====--->', Auther.decode(token), isProfileComplete);
        // let _d = { token, _username, _r: _role, _u_token, made_pay_, msg: 'Sign-in Successfull' };
        return { data: { msg: `Store Item Created!`, _id: create_store_item_res._id }, statusCode: 200, success: true };

        // let token = helpers.Crypto.encode_token({ $uid$: reqObj.payloadData['role'] });
        // return { success: false, statusCode: 400, data: { msg: 'Still testing'} }
    }

    return { success: false, statusCode: 500, data: { msg: 'Error creating store Item. Please try again!' } }



}