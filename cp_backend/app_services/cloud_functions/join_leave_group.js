const allowed_roles = ['cpUser_', 'cpAdmin$', '$Sys9'];

const required_fields = [
    'postAuthor.displayPhoto', 'postAuthor._username']

export let join_leave_group = async function (reqObj, model, helpers) {

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


    console.log('Following Page Ops ::: ----=> ', reqObj.payloadData, '\n -----------> Auth', helpers.auth$)



    // let the_follower = helpers.auth$.$uid$;

    let the_acting_user = reqObj.payloadData['the_acting_user'];

    let entity_to_act_on = reqObj.payloadData['entity_to_act_on'];

    let the_action = reqObj.payloadData['action'];

    // if (the_acting_user == entity_to_act_on) {
    //     return { data: { msg: 'Can\'t follow self' }, statusCode: 400, success: false };
    // }

    // delete reqObj.payloadData['action'];

    // delete reqObj.payloadData['cloud_action'];



    let $object_query = {};
    $object_query.$where = {};
    $object_query.find_one_from_many = true;

    $object_query.$where['_id'] = the_acting_user;


    let subject_query = {};
    subject_query.$where = {};
    subject_query.find_one_from_many = true;

    subject_query.$where['_id'] = entity_to_act_on;

    let _date_ = new Date();
    _date_ = _date_.toISOString();

    // @@ set following on object user
    let acting_user_data = {}, page_to_follow_data = {};

    if (the_action == 'join_group') {

        acting_user_data['$connections$.groups_joined_count'] = { '$add': 1 };
        acting_user_data['$update_sub_resource'] = {
            ops: "$addTo",
            collection: 'groupsUserJoined',
            // key: the_acting_user,
            $where: { _id: the_acting_user },
            indexKey: entity_to_act_on,
            value: `"${entity_to_act_on}":"${_date_}"`,
        };

        page_to_follow_data['$connections$.members_count'] = { '$add': 1 };
        page_to_follow_data['$update_sub_resource'] = {
            ops: "$addTo",
            collection: '$groupMembers',
            // key: the_acting_user,
            $where: { _id: entity_to_act_on },
            indexKey: the_acting_user,
            value: `"${the_acting_user}":"${_date_}"`,
        };

        // acting_user_data['$push'] = { 'connections_track.following': set_follow_connection_res.data._id };
        // acting_user_data['$add_string'] = { 'connections_track.following': entity_to_act_on + '~~' };

    }

    else {
        acting_user_data['$connections$.groups_joined_count'] = { '$add': -1 }
        acting_user_data['$update_sub_resource'] = {
            ops: "$removeFrom",
            collection: '$groupsUserJoined',
            // key: the_acting_user,
            $where: { _id: the_acting_user },
            indexKey: entity_to_act_on

        };

        page_to_follow_data['$connections$.members_count'] = { '$add': -1 }
        page_to_follow_data['$update_sub_resource'] = {
            ops: "$removeFrom",
            collection: '$groupMembers',
            // key: the_acting_user,
            $where: { _id: entity_to_act_on },
            indexKey: the_acting_user
        };
        // acting_user_data['$remove_string'] = { 'connections_track.following': entity_to_act_on + '~~' };
    }

    // let set_connection_on_object_profile_res = await cpUserProfileModel.reset({
    //     $where: $object_query.$where,
    //     authorizedRoles: '$$cpSystem$$',
    //     // data: { verified: 'true'},
    //     data: acting_user_data,
    //     __user_: { _uid: 'sysadmin', role: '$$cpSystem$$' }
    // });

    let set_many_follow_page_res = await model.reset_many({
        many_data: [
            {

                // $where: { _id: reqObj.payloadData.user_id },
                $where: { _id: the_acting_user },
                // authorizedRoles: '$$cpSystem$$',
                // data: { verified: 'true'},
                // data: {
                //     'isProfileComplete': 'true',
                //     'firstname': reqObj.payloadData['firstname'].trim(),
                //     'profileId': create_profile_res._id
                // },
                collection: 'cpProfiles',
                db_action: 'reset',
                data: acting_user_data,
                $last_edited_on$: _date_,
                $last_edited_by$: helpers.auth$.$uid$,
                // $user$: { $uid$: helpers.auth$.$uid$, role: helpers.auth$ },
                $user$: { $uid$: helpers.auth$.$uid$, role: '$$cpSystem$$' }

            },
            {

                // $where: { _id: reqObj.payloadData.user_id },
                $where: { _id: entity_to_act_on },
                // authorizedRoles: '$$cpSystem$$',
                // data: { verified: 'true'},
                // data: {
                //     'isProfileComplete': 'true',
                //     'firstname': reqObj.payloadData['firstname'].trim(),
                //     'profileId': create_profile_res._id
                // },
                collection: 'cpEntity',
                db_action: 'reset',
                data: page_to_follow_data,
                $last_edited_on$: _date_,
                $last_edited_by$: helpers.auth$.$uid$,
                // $user$: { $uid$: helpers.auth$.$uid$, role: helpers.auth$ },
                $user$: { $uid$: helpers.auth$.$uid$, role: '$$cpSystem$$' }

            }

        ]
    });

    console.log(' set_many_follow_page_res ::: ---<<>>>>>>>>', set_many_follow_page_res);


    // return { data: { msg: 'Following' }, statusCode: 200, success: true };

    if (set_many_follow_page_res.msg == 'Reset Many OK') {

        return { data: { msg: 'OK' }, statusCode: 200, success: true };

    }

    return { data: { msg: 'Error setting connection' }, statusCode: 500, success: false };

}