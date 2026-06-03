
// const { SqyDB_Model } = await import('../_lib_/SqyDB.Model.js');
const { SqyDB_Model } = await import('../_lib_/SqyDB.Model.js');

const { Crypto } = await import('../_lib_/Crypto.js');

const { utils } = await import('../_lib_/utils.js');

// const { get_entity } = await import('../cloud_functions/get_entity.js');

const { create_entity } = await import('../cloud_functions/create_entity.js');

const { follow_unfollow_page } = await import('../cloud_functions/follow_unfollow_page.js');

const { join_leave_group } = await import('../cloud_functions/join_leave_group.js');

const { get_basic_res_info } = await import('../cloud_functions/get_basic_res_info.js');

// const { get_entity_sub_resource } = await import('../cloud_functions/get_entity_sub_resource.js');

// const { get_user_chat } = await import('../cloud_functions/get_user_chat.js');

// const { auth_user } = await import('../cloud_functions/auth_user.js');

const controller_fncs = {

    // get_entity,
    create_entity,
    follow_unfollow_page,
    join_leave_group,
    get_basic_res_info
    // add_remove_sub_on_entity,
    // get_entity_sub_resource,
    // get_user_chat
};

// user_create_account = null;

// @@ user model declaration
let aNode = 'c1a'+Bun.argv[Bun.argv.indexOf('--node') + 1];

const controller_options = { 
    collection: 'cpEntity',
    
    schema: {

    }

};


const cp_entity_model = new SqyDB_Model({  // db: config._db,  
    collection: controller_options.collection,
    schema: controller_options.schema
});

const cp_profiles_model = new SqyDB_Model({  // db: config._db,  
    collection: 'cpProfiles',
    schema: {}
});



// @@ Uset Controller
export let theController = async function (reqObj) {

    try {

        // console.log('bcp_users_profiles ---- hit --==>', reqObj.payloadData );

        let auth$ = null;
        if ( !reqObj.auth ) {
            return { data: { msg: 'Authorization required. Kindly login!!' }, statusCode: 401, success: false };
        }

        if (typeof reqObj.auth == 'string' && reqObj.auth.length > 10) {

            auth$ = Crypto.decode(reqObj.auth);
        }

        if ( typeof reqObj.auth_expires == 'number'
            && typeof auth$ == 'object' && auth$ !== null
            && typeof auth$.timeSinceIssued == 'number' &&
            auth$.timeSinceIssued > reqObj.auth_expires

        ) {

            return { data: { msg: 'Expired Authorization. Kindly login again!!' }, statusCode: 401, success: false };
        }

        if ( !reqObj.payloadData && !reqObj.payloadData.cloud_action ) { 
            return { success: false, statusCode: 400, data: { msg: 'Cloud action missing' } }
        }
        
        // @@ -- Get Action to run 
        const { cloud_action } = reqObj.payloadData;
        delete reqObj.payloadData.cloud_action;

        // return { success: true, statusCode: 200, data: { msg: 'Profiling'} }
    
        if ( typeof controller_fncs[cloud_action] == 'function' ) {
    
            let cloud_response = await controller_fncs[cloud_action](reqObj, cp_entity_model, { cp_profiles_model, utils, Crypto, aNode, auth$});
    
            // console.log('cloud_response --=>', cloud_response );
            return cloud_response

        } 
        
        return { success: false, statusCode: 400, data: { msg: 'Invalid Cloud Action'} }
        
    } catch (error) {
        
        console.log(' -================================------->>>>>>>>>>>>>> Error performing OPs -====>', error );
        // await Bun.write('../error.txt', JSON.stringify(error) );
        return { success: false, statusCode: 500, data: { msg: `Error performing OPs`} }
    }

}


