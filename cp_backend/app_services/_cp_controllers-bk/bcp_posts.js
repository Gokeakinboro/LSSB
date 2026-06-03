
// const { SqyDB_Model } = await import('../_lib_/SqyDB.Model.js');
const { SqyDB_Model } = await import('../_lib_/SqyDB.Model.js');

const { Crypto } = await import('../_lib_/Crypto.js');

const { utils } = await import('../_lib_/utils.js');

// const { get_user_profile } = await import('../cloud_functions/get_user_profile.js');

const { create_post } = await import('../cloud_functions/create_post.js');

const { update_post } = await import('../cloud_functions/update_post.js');

const { like_unlike_posts } = await import('../cloud_functions/like_unlike_posts.js');

const { add_remove_post_comments } = await import('../cloud_functions/add_remove_post_comments.js');

const { fetch_media_center_feed } = await import('../cloud_functions/fetch_media_center_feed.js');

const { fetch_users_entity_posts } = await import('../cloud_functions/fetch_users_entity_posts.js');

const { get_post_item } = await import('../cloud_functions/get_post_item.js');

// const { auth_user } = await import('../cloud_functions/auth_user.js'); 

const controller_fncs = {

    create_post,
    update_post,
    like_unlike_posts,
    add_remove_post_comments,
    fetch_media_center_feed,
    fetch_users_entity_posts,
    get_post_item,

};

// user_create_account = null;

// @@ user model declaration
let aNode = 'c1a'+Bun.argv[Bun.argv.indexOf('--node') + 1];

const controller_options = { 
    collection: 'cpPosts',
    
    schema: {

        title: {
            type: ['string', 'String expected for title'],
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


const cp_posts_model = new SqyDB_Model({  // db: config._db,  
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

        // console.log('bcp_users_profiles ---- hit --==>', reqObj.payloadData );

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
        // console.log( 'cloud_action from payload :: -->', cloud_action, controller_fncs[cloud_action] );
    
        if ( typeof controller_fncs[cloud_action] == 'function' ) {
    
            let cloud_response = await controller_fncs[cloud_action](reqObj, cp_posts_model, { utils, Crypto, aNode, auth$} );
    
            console.log('bcp_posts cloud_response --=>', cloud_response );
            return cloud_response

        } 
        
        return { success: false, statusCode: 400, data: { msg: 'Invalid Posts Cloud Action'} }
        
    } catch (error) {
        
        console.log(' -================================------->>>>>>>>>>>>>> Error performing Posts OPs -====>', error );
        // await Bun.write('../error.txt', JSON.stringify(error) );
        return { success: false, statusCode: 500, data: { msg: `Error performing Posts OPs`} }
    }

}








// const { SqyDB_Model } = await import('../_lib_/SqyDB.Model.js');

// // let { user_create_account } = await import('../cloud_functions/user_create_account.js');

// const cp_posts_model = new SqyDB_Model({  // db: config._db,  
//     collection: 'cpPosts',
//     schema: {}
// });

// create_edit_posts

// let create_post_fn = function() {
//     console.log('creating posts');
// };

// const controller_fncs = {

//     create_post: create_post_fn
// };

// create_post_fn = null;

// // @@ Uset Controller
// export let theController = async function (reqObj) {

//     try {

//         if ( !reqObj.payloadData.cloud_action ) { 
//             return { success: false, statusCode: 400, data: { msg: 'Cloud action missing' } }
//          }
    
//         // console.log('bcp_users hit --==>', reqObj.payloadData );
//         // @@ -- Get Action to run
//         const { cloud_action } = reqObj.payloadData;
//         delete reqObj.payloadData.cloud_action;
    
//         if ( typeof controller_fncs[cloud_action] == 'function' ) {
    
//             let cloud_response = await controller_fncs[cloud_action](reqObj, cp_posts_model);
    
//             // console.log('cloud_response --=>', cloud_response );
    
//             return cloud_response
//         } 
    
        
//         return { success: false, statusCode: 400, data: { msg: 'Invalid Cloud Action'} }
        
//     } catch (error) {

//         return { success: false, statusCode: 500, data: { msg: 'Error performing OPs'} }
        
//     }

// }


