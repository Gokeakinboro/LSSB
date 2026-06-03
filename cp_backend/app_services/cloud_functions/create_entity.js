
// 
const allowed_roles = ['cpUser_', 'cpAdmin$', '$Sys9'];

const required_fields = [
    '_fields._sex', '_fields._dob', '_fields.country', 'displayPhoto', '_username', 'user_id']

export let create_entity = async function (reqObj, model, helpers) {

    console.log(' create Entity ------------------------0---------0--===>', reqObj.payloadData, helpers.auth$);

    // @@ --- Allowed roles to create
    if (!helpers.auth$.role || allowed_roles.indexOf(helpers.auth$.role) == -1) {

        return { data: { msg: 'Unauthorized Operation' }, statusCode: 401, success: false };
    }

    // @@ validation
    // if (!reqObj.payloadData['_fields'] ) {

    //     return { data: { msg: 'Kindly fill-in required fields' }, statusCode: 400, success: false };

    // }

    if (!reqObj.payloadData['_fields.title'] || reqObj.payloadData['_fields.title'] == 'null') {

        return { data: { msg: 'Title is required' }, statusCode: 400, success: false };

    }

    if (!reqObj.payloadData['_fields.description'] || reqObj.payloadData['_fields.description'] == 'null') {

        return { data: { msg: 'Enter Description' }, statusCode: 400, success: false };

    }

    if (!reqObj.payloadData['$managers'] || reqObj.payloadData['$managers'] == 'null') {

        return { data: { msg: 'At least one manager is required' }, statusCode: 400, success: false };

    }

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

    let create_entity_res = await model.set({ data: reqObj.payloadData });

    console.log(' creating --- -----00---- Entity  -===>', reqObj.payloadData, '\n create_entity_res --=>>>>', create_entity_res);

    // @@ -- 
    if (!create_entity_res) {

        // @@ rety until we grt a response from DB
        // db_set_response = await model.set({ data:reqObj.payloadData});
        return { success: false, statusCode: 500, data: { msg: 'Retry$' } }
    }

    if (create_entity_res && create_entity_res.msg == 'DB NOT READY') {

        return { success: false, statusCode: 500, data: { msg: 'SystemD not ready. Retry$' } }
    }

    if (create_entity_res && create_entity_res.msg == 'OK') {

        /**   
         * @@ -- Post Set OPs
         * @@ -- Update users model --- set managing so we know what they manage
         */
        // koko

        let reset_managing_user_data = {
            $push: {
                $managing: {

                    _id: create_entity_res._id,
                    entity_type: reqObj.payloadData.entity_type,

                }
            }
        }
        // reset_managing_user_data['$update_sub_resource'] = {
        //     ops: "$addTo",
        //     collection: '$followings',
        //     // key: the_follower_id,
        //     $where: { _id: the_follower_id },
        //     indexKey: user_to_follow_id,
        //     value: `"${user_to_follow_id}":"${_date_}"`,
        // };

        let theUserId = reqObj.payloadData.user_id;

        let update_management_on_managing_useer = await helpers.cp_profiles_model.reset({

            $where: { _id: theUserId },
            // authorizedRoles: '$$cpSystem$$',
            // data: { verified: 'true'},
            data: reset_managing_user_data,
            $user$: { $uid$: helpers.auth$.$uid$, role: helpers.auth$ }

        });

        // console.log(' update_management_on_managing_useer -=======----->>>', update_management_on_managing_useer, reqObj.payloadData );

        // @@ else 

        if (update_management_on_managing_useer.msg !== 'OK') {

            return { data: { msg: 'Error setting-up Entity Manager' }, statusCode: 500, success: false };
        }

        // @@ -- if it's a Group..
        // @@ Add this user/manager as first member to group_sub_resource
        // @@ -- Update groups user this a member of
        if (reqObj.payloadData['entity_type'] == 'Group') {


            let _date_ = new Date();
            _date_ = _date_.toISOString();

            // @@ set following on object user
            let group_conne_data = {}, user_group_conn_data = {};

            group_conne_data['$connections$.members_count'] = { '$add': 1 };
            group_conne_data['$update_sub_resource'] = {
                ops: "$addTo",
                collection: '$groupMembers',
                // key: the_follower_id,
                $where: { _id: create_entity_res._id },
                // indexKey: update_management_on_managing_useer.updatedDoc._id,
                indexKey: theUserId,
                value: `"${theUserId}":"${_date_}"`,
            };

            user_group_conn_data['$connections$.groups_joined_count'] = { '$add': 1 };
            user_group_conn_data['$update_sub_resource'] = {
                ops: "$addTo",
                collection: '$groupsUserJoined',
                // key: the_follower_id,
                $where: { _id: theUserId },
                indexKey: create_entity_res._id,
                value: `"${create_entity_res._id}":"${_date_}"`,
            };



            let set_connection_on_profile_and_group_res = await model.reset_many({
                many_data: [
                    {

                        $where: { _id: create_entity_res._id },
                        collection: 'cpEntity',
                        db_action: 'reset',
                        data: group_conne_data,
                        $last_edited_on$: _date_,
                        $last_edited_by$: '$$cpSystem$$',
                        // $user$: { $uid$: helpers.auth$.$uid$, role: helpers.auth$ },
                        $user$: { $uid$: helpers.auth$.$uid$, role: '$$cpSystem$$' }

                    },
                    {

                        // $where: { _id: reqObj.payloadData.user_id },
                        $where: { _id: theUserId },
                        collection: 'cpProfiles',
                        db_action: 'reset',
                        data: user_group_conn_data,
                        $last_edited_on$: _date_,
                        $last_edited_by$: '$$cpSystem$$',
                        // $user$: { $uid$: helpers.auth$.$uid$, role: helpers.auth$ },
                        $user$: { $uid$: helpers.auth$.$uid$, role: '$$cpSystem$$' }

                    }

                ]
            });


            console.log(' set_connection_on_profile_and_group_res ::: ---<<>>>>>>>>', set_connection_on_profile_and_group_res );

            if ( set_connection_on_profile_and_group_res.msg == "Reset Many OK") {

                return { data: { msg: `${reqObj.payloadData.entity_type} Created!`, _id: create_entity_res._id }, statusCode: 200, success: true };
            }


            return { data: { msg: `${reqObj.payloadData.entity_type} Created! Updating Props`, _id: create_entity_res._id }, statusCode: 200, success: true };


        }

        // console.log('Toker rev ---->', token, ' --====--->', Auther.decode(token), isProfileComplete);
        // let _d = { token, _username, _r: _role, _u_token, made_pay_, msg: 'Sign-in Successfull' };
        return { data: { msg: `${reqObj.payloadData.entity_type} Created!`, _id: create_entity_res._id }, statusCode: 200, success: true };

        // let token = helpers.Crypto.encode_token({ $uid$: reqObj.payloadData['role'] });
        // return { success: false, statusCode: 400, data: { msg: 'Still testing'} }
    }

    return { success: false, statusCode: 500, data: { msg: 'Error creating Entity. Please try again!' } }



}