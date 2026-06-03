
// const { write__unlink_comment_to_store } = await import('../cloud_functions/write__unlink_comment_to_store.js');


export let add_comment = async function (reqObj, model, helpers) {


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


    console.log(' Comment Ops :-:: ----=> ', reqObj.payloadData, ' \n -----------> Auth', helpers.auth$);



    let the_post_id = reqObj.payloadData['post_id'];
    // let the_action = reqObj.payloadData['action'];

    let _date_ = new Date();
    _date_ = _date_.toISOString();

    reqObj.payloadData._date = _date_;

    let add_comment_to_post_res = await model.set({data:reqObj.payloadData});

    // _id: add_comment_to_post_res._id
    // console.log(' create --- -----00---- Comment  -===>', reqObj.payloadData, '\n add_comment_to_post_res --=>>>>', 'add_comment_to_post_res');

    // return { data: { msg: 'OK' }, statusCode: 200, success: true };
    // ---  tyui - p -

    // @@ -- 
    if (!add_comment_to_post_res) {

        // @@ rety until we grt a response from DB
        // db_set_response = await model.set({ data:reqObj.payloadData});

        return { success: false, statusCode: 500, data: { msg: 'Retry$' } }
    }

    if (add_comment_to_post_res && add_comment_to_post_res.msg == 'DB NOT READY') {

        return { success: false, statusCode: 500, data: { msg: 'SystemD not ready. Retry$' } }
    }

    if (add_comment_to_post_res && add_comment_to_post_res.msg == 'OK') {

        /**   
         * @@ -- Post Set OPs
         * @@ -- Create connections collection for this post
         */

        // @@ create connections collection for this Post
        // -- should be in a GO Routine later -- 
        // -- consider memory overheads and when to just use Queue and Workers
        // await model.setup_resource_collection({ _id: add_comment_to_post_res._id });
        let update_post_with_comment_data_res = await helpers.cp_posts_model.reset({

            $where: { _id: the_post_id },
            // authorizedRoles: '$$cpSystem$$',
            // data: { verified: 'true'},
            // data: {
            //     'isProfileComplete': 'true',
            //     'firstname': reqObj.payloadData['firstname'].trim(),
            //     'profileId': create_profile_res._id
            // },
            data: {

                '$connections$.comments_count': { '$add': 1 },
                $push: {
                    $comments: {

                        _id: add_comment_to_post_res._id,
                        responseText: reqObj.payloadData.responseText,
                        responseAuthor: {
                            displayPhoto: reqObj.payloadData.responseAuthor.displayPhoto,
                            fullname: reqObj.payloadData.responseAuthor.fullname,
                            _id: reqObj.payloadData.responseAuthor._id,
                        },
                    }
                },

                $push_max$: 3,
            },

            $user$: { $uid$: helpers.auth$.$uid$, role: helpers.auth$ }

        });

        console.log(' update_post_with_comment_data_res --- -----00---- Comment  -===> --=>>>>', update_post_with_comment_data_res );
        
        if ( update_post_with_comment_data_res.msg == 'OK') {

            return { data: { msg: 'OK', new_comment_count: update_post_with_comment_data_res.updatedDoc.$connections$.comments_count }, statusCode: 200, success: true };

        }

        // return { data: { msg: 'OK' }, statusCode: 200, success: true };

        return { data: { msg: 'Comment Set', _id: add_comment_to_post_res._id }, statusCode: 200, success: true };


    }

    return { success: false, statusCode: 500, data: { msg: 'Error adding comment. Please try again!' } }



}