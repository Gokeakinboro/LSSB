

// add_remove_post_comments

export let add_remove_post_comments = async function (reqObj, model, helpers) {

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


    console.log(' Adding Post Comments Ops ::: ----=> ', reqObj.payloadData, '\n -----------> Auth', helpers.auth$)


    // return { data: { msg: 'Liking Post' }, statusCode: 200, success: true };

    // let the_follower = helpers.auth$.$uid$;

    // let commenting_user = reqObj.payloadData['commenting_user'];

    return { data: { msg: 'OK' }, statusCode: 200, success: true };

    let the_post_id = reqObj.payloadData['post_id'];

    let the_action = reqObj.payloadData['action'];

    // if (the_follower_id == user_to_follow_id) {
    //     return { data: { msg: 'Can\'t follow self' }, statusCode: 400, success: false };
    // }

    // delete reqObj.payloadData['action'];

    // delete reqObj.payloadData['cloud_action'];

    let _date_ = new Date();
    _date_ = _date_.toISOString();

    // @@ set following on object user
    let acted_on_post_data = {}, acting_user_data = {};

    if (the_action == 'add_comment') {

        acted_on_post_data['$connections$.comments_count'] = { '$add': 1 };
        acted_on_post_data['$update_sub_resource'] = {

            ops: "$addTo",
            sub_resource_type: 'single',
            collection: '$postComments',
            // key: the_follower_id,
            $where: { _id: the_post_id },
            indexKey: commenting_user,
            value: `"${commenting_user}":"${_date_}"`,

        };

        // acting_user_data['$connections$.followers_count'] = { '$add': 1 };
        acting_user_data['$last_edited_on'] = _date_;
        acting_user_data['$update_sub_resource'] = {
            ops: "$addTo",
            sub_resource_type: 'single',
            collection: '$postsUserCommentedOn',
            // key: the_follower_id,
            $where: { _id: commenting_user },
            indexKey: the_post_id,
            value: `"${the_post_id}":"${_date_}"`,
        };

        // acted_on_post_data['$push'] = { 'connections_track.following': set_follow_connection_res.data._id };
        // acted_on_post_data['$add_string'] = { 'connections_track.following': user_to_follow_id + '~~' };

    }

    else {
        
        acted_on_post_data['$connections$.comments_count'] = { '$add': -1 }
        acted_on_post_data['$update_sub_resource'] = {
            ops: "$removeFrom",
            sub_resource_type: 'single',
            collection: '$postComments',
            // key: the_follower_id,
            $where: { _id: the_post_id },
            indexKey: commenting_user

        };

        acting_user_data['$last_edited_on'] = _date_;
        acting_user_data['$update_sub_resource'] = {
            ops: "$removeFrom",
            sub_resource_type: 'single',
            collection: '$postsUserCommentedOn',
            // key: the_follower_id,
            $where: { _id: commenting_user },
            indexKey: the_post_id,
        };
        // acted_on_post_data['$remove_string'] = { 'connections_track.following': user_to_follow_id + '~~' };
    }

    // let set_connection_on_object_profile_res = await cpUserProfileModel.reset({
    //     $where: $object_query.$where,
    //     authorizedRoles: '$$cpSystem$$',
    //     // data: { verified: 'true'},
    //     data: acted_on_post_data,
    //     __user_: { _uid: 'sysadmin', role: '$$cpSystem$$' }
    // });

    let set_connection_on_user_posts_and_profiles_res = await model.reset(

        {

            // $where: { _id: reqObj.payloadData.user_id },
            $where: { _id: the_post_id },
            // authorizedRoles: '$$cpSystem$$',
            // data: { verified: 'true'},
            // data: {
            //     'isProfileComplete': 'true',
            //     'firstname': reqObj.payloadData['firstname'].trim(),
            //     'profileId': create_profile_res._id
            // },

            collection: 'cpPosts',
            db_action: 'reset',
            data: acted_on_post_data,
            $last_edited_on$: _date_,
            $last_edited_by$: helpers.auth$.$uid$,
            // $user$: { $uid$: helpers.auth$.$uid$, role: helpers.auth$ },
            $user$: { $uid$: helpers.auth$.$uid$, role: '$$cpSystem$$' }

        },
    );

    console.log(' set_connection_on_user_posts_and_profiles_res ::: ---<<>>>>>>>>', set_connection_on_user_posts_and_profiles_res);

    if (typeof set_connection_on_user_posts_and_profiles_res.msg == 'string' && set_connection_on_user_posts_and_profiles_res.msg.indexOf('OK') > -1) {

        return {
            data: {
                msg: 'OK',
                new_like_count: set_connection_on_user_posts_and_profiles_res.data._id ? set_connection_on_user_posts_and_profiles_res.data.$connections$.comments_count : '+1'
            },
            statusCode: 200, success: true
        };

    }

    // return { data: { msg: 'Liking' }, statusCode: 200, success: true };
    return { data: { msg: 'Error Liking Post' }, statusCode: 500, success: false };
}