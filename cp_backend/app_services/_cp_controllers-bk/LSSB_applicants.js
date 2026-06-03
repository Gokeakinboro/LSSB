
// const { SqyDB_Model } = await import('../_lib_/SqyDB.Model.js');
const { SqyDB_Model } = await import('../_lib_/SqyDB.Model.js');

const { Crypto } = await import('../_lib_/Crypto.js');

const { utils } = await import('../_lib_/utils.js');

const { get_user_profile } = await import('../cloud_functions/get_user_profile.js');

const { create_user_profile } = await import('../cloud_functions/create_user_profile.js');

const { follow_unfollow_user } = await import('../cloud_functions/follow_unfollow_user.js');

const { get_user_sub_resource } = await import('../cloud_functions/get_user_sub_resource.js');

const { get_user_chat } = await import('../cloud_functions/get_user_chat.js');

const { fetch_user_group_joined_and_pages_managing } = await import('../cloud_functions/fetch_user_group_joined_and_pages_managing.js');

const { get_basic_res_info } = await import('../cloud_functions/get_basic_res_info.js');

const { fetch_discover_feed } = await import('../cloud_functions/fetch_discover_feed.js');

// const { auth_user } = await import('../cloud_functions/auth_user.js');

const controller_fncs = {

    get_user_profile,
    get_basic_res_info,
    create_user_profile,
    follow_unfollow_user,
    get_user_sub_resource,
    fetch_discover_feed,
    get_user_chat,
    fetch_user_group_joined_and_pages_managing
};

// user_create_account = null;

// @@ user model declaration
let aNode = 'c1a'+Bun.argv[Bun.argv.indexOf('--node') + 1];

const controller_options = { 
    collection: 'cpProfiles',
    
    schema: {

        surname: {
            type: ['string', 'String expected for Surname'],
            // unique: [true, ' fullname has been taken!'],      
            required: [true, 'Surname is required']
            // default: ''
        },

        firstname: {
            type: ['string', 'String expected for Firstname'],
            required: [true, 'First name is required']

        },

        fullname: {
            type: ['string', 'String expected for fullname'],    // concat sur and last names  
            required: [true, 'Fullname is required']
        },

        _email: {

            // type: ['number', 'Number expected for email'],
            type: ['string', 'String expected for email'],
            unique: [true, 'A profile with this email already exist!'],
            required: [true, 'Email is required'],
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email'
            ]
        },

        _username: {
            type: ['string', 'String expected for Username'],
            unique: [true, 'A profile with this Username already exist!'],
            required: [true, 'Username is required']
        },

        // _sex: {
        //     type: ['string', 'String expected for sex'],
        //     // required: [true, 'Sex is required']
        // },

        // _dob: {
        //     type: ['string', 'Date expected for Date of Birth'],
        //     // required: [true, 'Sex is required']
        // },

        displayPhoto: {
            type: ['string', 'Image expected for Display Photo'],
            default: 'NILL'
        },

        // resource_type: {
        //     type: ['string', 'String expected for resource_type'],
        //     default: 'cp_profile'
        // },

        connections: { // formerly meta
            type: ['schema_object', 'Object notation expected for Meta'],
            default: {}
        },

        // @@ for caching ids of post this user likes , id of people user follows etc... an array
    
        // connections: { // formerly meta
        //     type: ['schema_object', 'Object notation expected for Meta'],
        //     default: {
        //         followers: 0,
        //         following: 0,
        //         views: 0,
        //         posts: 0,
        //         post_like_read: 0,
        //         conn1: 0,
        //         conn2: 0,
        //         conn3: 0,
        //         conn4: 0
        //     }
        // },

        // connections_track: { // track each conecetions id
        //     type: ['schema_object', 'Object notation expected for Meta'],
        //     default: {
        //         followers: '~~',
        //         following: '~~',
        //         views: [],
        //         posts: [],
        //         post_like_read: [], //track read and liked posts for sorting later
        //         post_reacted: '~~',
        //         post_read: '~~',
        //         post_commented: '~~',
        //         conn1: [],
        //         conn2: [],
        //         conn3: [],
        //         conn4: []
        //     }
        // },
        _fields: {
            type: ['schema_object', 'Object notation expected for Fields'],
            default: {}
        },

        attr: {
            type: ['schema_object', 'Object notation expected for attr'],
            default: {}
        },

        // @@ pages managed, groups created etc
        managing: {
            type: ['schema_object', 'Object notation expected for Managing'],
            default: {},
        },


        // @@ system metas
        // .$creator$ important for sensitive resources
        $creator$: {
            type: ['string', 'String expected for $creator$'],
            required: [true, 'Please provide this resource\'s creator'],
        },

        $lastEditedBy$: {
            type: ['string', 'String expected for lastEditedBy'],
            default: 'System_'
        },
    }

};


const cp_users_profiles_model = new SqyDB_Model({  // db: config._db,  
    collection: controller_options.collection,
    schema: controller_options.schema
});

const cp_users_model = new SqyDB_Model({  // db: config._db,  
    collection: 'cpUser',
    schema: {}
});

// const followers_model = new SqyDB_Model({  // db: config._db,  
//     collection: '$followers',
//     schema: {}
// });

// const followings_model = new SqyDB_Model({  // db: config._db,  
//     collection: '$followings',
//     schema: {}
// });


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
    
            let cloud_response = await controller_fncs[cloud_action](reqObj, cp_users_profiles_model, { cp_users_model, utils, Crypto, aNode, auth$});
    
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


