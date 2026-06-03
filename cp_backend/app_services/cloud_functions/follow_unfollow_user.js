const allowed_roles = ['cpUser_', 'cpAdmin$', '$Sys9'];

const required_fields = [
    'postAuthor.displayPhoto', 'postAuthor._username']

export let follow_unfollow_user = async function (reqObj, model, helpers) {

    // @@ --- Allowed roles to create
    if (!helpers.auth$) {
        return { data: { msg: 'Authorization required. Kindly login!!' }, statusCode: 401, success: false };
    }

    if (typeof reqObj.auth_expires == 'number'
        && typeof helpers.auth$ == 'object' && helpers.auth$ !== null
        && typeof helpers.auth$.timeSinceIssued == 'number' &&
        auth$.timeSinceIssued > reqObj.auth_expires

    ) {

        return { data: { msg: 'Expired Authorization. Kindly login again!!' }, statusCode: 401, success: false };
    }


    console.log('Following Ops ::: ----=> ', reqObj.payloadData, '\n -----------> Auth', helpers.auth$)



    // let the_follower = helpers.auth$.$uid$;

    let the_follower_id = reqObj.payloadData['the_follower_id'];

    let user_to_follow_id = reqObj.payloadData['user_to_follow'];

    let the_action = reqObj.payloadData['action'];

    if (the_follower_id == user_to_follow_id) {
        return { data: { msg: 'Can\'t follow self' }, statusCode: 400, success: false };
    }

    // delete reqObj.payloadData['action'];

    // delete reqObj.payloadData['cloud_action'];



    let $object_query = {};
    $object_query.$where = {};
    $object_query.find_one_from_many = true;

    $object_query.$where['_id'] = the_follower_id;


    let subject_query = {};
    subject_query.$where = {};
    subject_query.find_one_from_many = true;

    subject_query.$where['_id'] = user_to_follow_id;

    let _date_ = new Date();
    _date_ = _date_.toISOString();

    // @@ set following on object user
    let subject_data = {}, object_data = {};

    if (the_action == 'follow') {

        subject_data['$connections$.following_count'] = { '$add': 1 };
        subject_data['$update_sub_resource'] = {
            ops: "$addTo",
            collection: '$followings',
            // key: the_follower_id,
            $where: { _id: the_follower_id },
            indexKey: user_to_follow_id,
            value: `"${user_to_follow_id}":"${_date_}"`,
        };

        object_data['$connections$.followers_count'] = { '$add': 1 };
        object_data['$update_sub_resource'] = {
            ops: "$addTo",
            collection: '$followers',
            // key: the_follower_id,
            $where: { _id: user_to_follow_id },
            indexKey: the_follower_id,
            value: `"${the_follower_id}":"${_date_}"`,
        };

        // subject_data['$push'] = { 'connections_track.following': set_follow_connection_res.data._id };
        // subject_data['$add_string'] = { 'connections_track.following': user_to_follow_id + '~~' };

    }

    else {
        subject_data['$connections$.following_count'] = { '$add': -1 }
        subject_data['$update_sub_resource'] = {
            ops: "$removeFrom",
            collection: '$followings',
            // key: the_follower_id,
            $where: { _id: the_follower_id },
            indexKey: user_to_follow_id

        };

        object_data['$connections$.followers_count'] = { '$add': -1 }
        object_data['$update_sub_resource'] = {
            ops: "$removeFrom",
            collection: '$followers',
            // key: the_follower_id,
            $where: { _id: user_to_follow_id },
            indexKey: the_follower_id
        };
        // subject_data['$remove_string'] = { 'connections_track.following': user_to_follow_id + '~~' };
    }

    // let set_connection_on_object_profile_res = await cpUserProfileModel.reset({
    //     $where: $object_query.$where,
    //     authorizedRoles: '$$cpSystem$$',
    //     // data: { verified: 'true'},
    //     data: subject_data,
    //     __user_: { _uid: 'sysadmin', role: '$$cpSystem$$' }
    // });

    let set_connection_on_user_profile_res = await model.reset_many({
        many_data: [
            {

                // $where: { _id: reqObj.payloadData.user_id },
                $where: { _id: the_follower_id },
                // authorizedRoles: '$$cpSystem$$',
                // data: { verified: 'true'},
                // data: {
                //     'isProfileComplete': 'true',
                //     'firstname': reqObj.payloadData['firstname'].trim(),
                //     'profileId': create_profile_res._id
                // },
                collection: 'cpProfiles',
                db_action: 'reset',
                data: subject_data,
                $last_edited_on$: _date_,
                $last_edited_by$: helpers.auth$.$uid$,
                // $user$: { $uid$: helpers.auth$.$uid$, role: helpers.auth$ },
                $user$: { $uid$: helpers.auth$.$uid$, role: '$$cpSystem$$' }

            },
            {

                // $where: { _id: reqObj.payloadData.user_id },
                $where: { _id: user_to_follow_id },
                // authorizedRoles: '$$cpSystem$$',
                // data: { verified: 'true'},
                // data: {
                //     'isProfileComplete': 'true',
                //     'firstname': reqObj.payloadData['firstname'].trim(),
                //     'profileId': create_profile_res._id
                // },
                collection: 'cpProfiles',
                db_action: 'reset',
                data: object_data,
                $last_edited_on$: _date_,
                $last_edited_by$: helpers.auth$.$uid$,
                // $user$: { $uid$: helpers.auth$.$uid$, role: helpers.auth$ },
                $user$: { $uid$: helpers.auth$.$uid$, role: '$$cpSystem$$' }

            }

        ]
    });

    console.log(' set_connection_on_user_profile_res ::: ---<<>>>>>>>>', set_connection_on_user_profile_res);


    // return { data: { msg: 'Following' }, statusCode: 200, success: true };

    if (set_connection_on_user_profile_res.msg == 'Reset Many OK') {

        return { data: { msg: 'OK' }, statusCode: 200, success: true };

    }

    return { data: { msg: 'Error setting connection' }, statusCode: 500, success: false };

    // if (set_connection_on_object_profile_res.msg == 'done') {

    //     let data_s = {};

    //     if (the_action == 'follow') {

    //         data_s['$add'] = { '$connections$.followers_count': 1 };
    //         // subject_data['$add_string'] = { 'connections_track.followers': the_follower + '~~' };

    //     }

    //     else {
    //         data_s['$add'] = { 'connections.followers_count': -1 }
    //         // subject_data['$remove_string'] = { 'connections_track.followers': the_follower + '~~' };
    //     }

    //     let set_connection_on_subject_profile_res = await cp_users_profiles_model.reset({
    //         $where: subject_query.$where,
    //         authorizedRoles: '$$cpSystem$$',
    //         // data: { verified: 'true'},
    //         data: data_s,
    //         // __user_: { _uid: 'sysadmin', role: '$$cpSystem$$' }
    //         $user$: { $uid$: helpers.auth$.$uid$, role: '$$cpSystem$$' }
    //     });

    //     if (set_connection_on_subject_profile_res.msg == 'done') {

    //         return _u.Response({ msg: 'OK__' }, 200, true)

    //     }

    //     return _u.Response({ msg: 'Error setting connection' }, 500, false);

    // }


    // return _u.Response({ msg: 'Error setting connection' }, 500, false);
}