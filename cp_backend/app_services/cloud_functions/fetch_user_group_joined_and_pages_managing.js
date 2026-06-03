// fetch_user_group_joined_and_pages_managing

export let fetch_user_group_joined_and_pages_managing = async function (reqObj, model, helpers) {

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


    let get_users_groups_joined_res = await model.get_sub_resource({
        
        collection: `$groupsUserJoined`,
        sub_resource_parent_collection: 'cpEntity',
        $projection: ['_fields', '_id' ],
        $where : { _id: reqObj.payloadData['userId'] }
    });

    console.log(' -->>>>>>>>>>>> get_user_sub_resource db_response -===>', get_users_groups_joined_res );
    

    if ( get_users_groups_joined_res.msg == 'OK') {

        if ( reqObj.payloadData['pages_managed'] && typeof reqObj.payloadData['pages_managed'].length == 'number' && reqObj.payloadData['pages_managed'].length > 0) {

            let get_many_from_keys_res = await model.get_many_from_keys({
        
                fromCollection: `cpEntity`,
                // dataKey: '_id',
                indexPointer: '_id',
                dataKeyValues: reqObj.payloadData['pages_managed'].map( ent => ent._id || ent),
                $projection: ['_fields', '_id' ],
                // $where : { _id: reqObj.payloadData['userId'] }
            });

            console.log(' -->>>>>>>>>>>> get_many_from_keys_res _response -===>', get_many_from_keys_res, 'keyv -->', reqObj.payloadData['pages_managed'], 'khj --->', reqObj.payloadData['pages_managed'].map( ent => ent._id) );;


            if ( get_many_from_keys_res.msg == "OK") {

                get_many_from_keys_res.docs = [...get_many_from_keys_res.docs, ...get_users_groups_joined_res.docs]

                return { data: { msg: 'OK', data: get_many_from_keys_res.docs }, statusCode: 200, success: true };
            }


            return { data: { msg: 'OK', data: "Error fetching user's entities" }, statusCode: 500, success: false };

            
        }

        // console.log(' -->>>>>>>>>>>> get_many_from_keys_res _response -===>', get_many_from_keys_res );

        return { data: { msg: 'OK', data: get_users_groups_joined_res.docs }, statusCode: 200, success: true };
    }

    return { data: { msg: 'Error fetching users Entities' }, statusCode: 200, success: true };

};