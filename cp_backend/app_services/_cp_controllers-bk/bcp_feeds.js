
// const { SqyDB_Model } = await import('../_lib_/SqyDB.Model.js');
const { SqyDB_Model } = await import('../_lib_/SqyDB.Model.js');

const { Crypto } = await import('../_lib_/Crypto.js');

const { utils } = await import('../_lib_/utils.js');

// const { get_user_profile } = await import('../cloud_functions/get_user_profile.js');

const { fetch_home_feed } = await import('../cloud_functions/fetch_home_feed.js');

// const { auth_user } = await import('../cloud_functions/auth_user.js'); 

const controller_fncs = {

    fetch_home_feed
};

// user_create_account = null;

// @@ user model declaration
let aNode = 'c1a'+Bun.argv[Bun.argv.indexOf('--node') + 1];

const controller_options = { 
    collection: 'cpFeeds',
    
    schema: {

        title: {
            type: ['string', 'String expected for title'],
            // unique: [true, ' fullname has been taken!'],      
            required: [true, 'Surname is required']
            // default: ''
        },
    }

};


const cp_feeds_model = new SqyDB_Model({  // db: config._db,  
    collection: controller_options.collection,
    schema: controller_options.schema
});

// const cp_users_model = new SqyDB_Model({  // db: config._db,  
//     collection: 'cpUser',
//     schema: {}
// });


// @@ Uset Controller
export let theController = async function (reqObj) {

    try {

        // console.log('bcp_feeds ---- hit --==>', reqObj.payloadData );

        let auth$ = null;
        // if ( !reqObj.auth ) {
        //     return { data: { msg: 'Authorization required. Kindly login!!' }, statusCode: 401, success: false };
        // }

        if (typeof reqObj.auth == 'string' && reqObj.auth.length > 10) {

            auth$ = Crypto.decode(reqObj.auth);
        }

        // if ( typeof reqObj.auth_expires == 'number'
        //     && typeof auth$ == 'object' && auth$ !== null
        //     && typeof auth$.timeSinceIssued == 'number' &&
        //     auth$.timeSinceIssued > reqObj.auth_expires

        // ) {

        //     return { data: { msg: 'Expired Authorization. Kindly login again!!' }, statusCode: 401, success: false };
        // }

        if ( !reqObj.payloadData && !reqObj.payloadData.cloud_action ) { 
            return { success: false, statusCode: 400, data: { msg: 'Cloud action missing' } }
        }
        
        // @@ -- Get Action to run 
        const { cloud_action } = reqObj.payloadData;
        delete reqObj.payloadData.cloud_action;

        // return { success: true, statusCode: 200, data: { msg: 'Profiling'} }
    
        if ( typeof controller_fncs[cloud_action] == 'function' ) {
    
            let cloud_response = await controller_fncs[cloud_action](reqObj, cp_feeds_model, { utils, Crypto, aNode, auth$} );
    
            // console.log('cloud_response --=>', cloud_response );
            return cloud_response

        } 
        
        return { success: false, statusCode: 400, data: { msg: 'Invalid Feeds Cloud Action'} }
        
    } catch (error) {
        
        console.log(' -================================------->>>>>>>>>>>>>> Error performing Feeds OPs -====>', error );
        // await Bun.write('../error.txt', JSON.stringify(error) );
        return { success: false, statusCode: 500, data: { msg: `Error performing Feeds OPs`} }
    }

}

