
// 
const allowed_roles = ['cpUser_', 'cpAdmin$', '$Sys9'];

const required_fields = [
    '_fields._sex', '_fields._dob', '_fields.country', 'displayPhoto', '_username', 'user_id']

export let create_user_profile = async function (reqObj, model, helpers) {

    console.log(' create Profile ------------------------0---------0--===>', reqObj.payloadData, helpers.auth$);

    // @@ --- Allowed roles to create
    if (!helpers.auth$.role || allowed_roles.indexOf(helpers.auth$.role) == -1) {

        return { data: { msg: 'Unauthorized Operation' }, statusCode: 401, success: false };
    }

    // @@ validation
    if (!reqObj.payloadData['firstname'] || reqObj.payloadData['firstname'] == 'null') {

        return { data: { msg: 'First name is required' }, statusCode: 400, success: false };

    }

    if (!reqObj.payloadData['surname'] || reqObj.payloadData['surname'] == 'null') {

        return { data: { msg: 'Surname is required' }, statusCode: 400, success: false };

    }

    if (!reqObj.payloadData['_fields._sex'] || reqObj.payloadData['_fields._sex'] == 'null') {

        return { data: { msg: 'Sex is required' }, statusCode: 400, success: false };

    }

    if (!reqObj.payloadData['_fields._dob'] || reqObj.payloadData['_fields._dob'] == 'null') {

        return { data: { msg: 'Kindly enter Date of Birth' }, statusCode: 400, success: false };

    }

    if (!reqObj.payloadData['_fields.country'] || reqObj.payloadData['_fields.country'] == 'null') {

        return { data: { msg: 'Kindly Specify your Country and City' }, statusCode: 400, success: false };

    }

    if (!reqObj.payloadData['displayPhoto'] || reqObj.payloadData['displayPhoto'] == 'null.jpg') {

        return { data: { msg: 'Kindly upload a Display Photo' }, statusCode: 400, success: false };

    }

    if (!reqObj.payloadData['user_id'] || reqObj.payloadData['user_id'] == 'null') {

        return { data: { msg: 'Kindly Specify User ID' }, statusCode: 400, success: false };

    }

    // @@ -- unique check here when get is ready
    let check_unique_username = await model.check_exists({ $where: { user_id: reqObj.payloadData.user_id } });

    // console.log('check_unique_username ---=>>', check_unique_username);

    if (check_unique_username && check_unique_username.msg) {


        let set_profileComplete_on_user = await helpers.cp_users_model.reset({

            $where: { _id: reqObj.payloadData.user_id },
            // authorizedRoles: '$$cpSystem$$',
            // data: { verified: 'true'},
            data: {
                'isProfileComplete': 'true',
                'firstname': reqObj.payloadData['firstname'].trim(),
                'profileId': check_unique_username._id
            },
            $user$: { $uid$: helpers.auth$.$uid$, role: helpers.auth$ }

        });

        // console.log(' 83 set_profileComplete_on_user in check exist -=======----->>>', set_profileComplete_on_user);

        // @@ else 
        if (set_profileComplete_on_user !== 'OK') {

            return { data: { msg: 'Error setting-up profile' }, statusCode: 500, success: false };
        }

        // let _d = { token, _username, _r: _role, _u_token, made_pay_, msg: 'Sign-in Successfull' };
        return { data: { msg: 'Profile set-up Successfull', _id: check_unique_username._id }, statusCode: 200, success: true };

        // return { success: false, statusCode: 400, data: { msg: 'User with this Profile already exists' } }
    }


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

    let create_profile_res = await model.set({ data: reqObj.payloadData });

    console.log(' creating --- -----00---- User profile  -===>', reqObj.payloadData, '\n create_profile_res --=>>>>', create_profile_res);

    // @@ -- 
    if (!create_profile_res) {

        // @@ rety until we grt a response from DB
        // db_set_response = await model.set({ data:reqObj.payloadData});

        return { success: false, statusCode: 500, data: { msg: 'Retry$' } }
    }

    if (create_profile_res && create_profile_res.msg == 'DB NOT READY') {

        return { success: false, statusCode: 500, data: { msg: 'SystemD not ready. Retry$' } }
    }

    if (create_profile_res && create_profile_res.msg == 'OK') {

        /**   
         * @@ -- Post Set OPs
         * @@ -- Update users model
         */
        // koko


        let set_profileComplete_on_user = await helpers.cp_users_model.reset({

            $where: { _id: reqObj.payloadData.user_id },
            // authorizedRoles: '$$cpSystem$$',
            // data: { verified: 'true'},
            data: {
                'isProfileComplete': 'true',
                'firstname': reqObj.payloadData['firstname'].trim(),
                'profileId': create_profile_res._id
            },
            $user$: { $uid$: helpers.auth$.$uid$, role: helpers.auth$ }

        });

        // console.log(' set_profileComplete_on_user -=======----->>>', set_profileComplete_on_user);

        // @@ else 

        if (set_profileComplete_on_user.msg !== 'OK') {

            return { data: { msg: 'Error setting-up profile' }, statusCode: 500, success: false };
        }

        // console.log('Toker rev ---->', token, ' --====--->', Auther.decode(token), isProfileComplete);
        // let _d = { token, _username, _r: _role, _u_token, made_pay_, msg: 'Sign-in Successfull' };
        return { data: { msg: 'Profile set-up Successfull', _id: create_profile_res._id }, statusCode: 200, success: true };

        // let token = helpers.Crypto.encode_token({ $uid$: reqObj.payloadData['role'] });
        // return { success: false, statusCode: 400, data: { msg: 'Still testing'} }
    }

    return { success: false, statusCode: 500, data: { msg: 'Error creating Profile. Please try again!' } }



}