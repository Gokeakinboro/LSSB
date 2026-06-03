
// const { SqyDB_Model } = await import('../_lib_/SqyDB.Model.js');
const { SqyDB_Model } = await import('../_lib_/SqyDB.Model.js');

// let { user_create_account } = await import('../cloud_functions/user_create_account.js');

// const { get_user } = await import('../cloud_functions/get_user.js');

const { Crypto } = await import('../_lib_/Crypto.js');

const { utils } = await import('../_lib_/utils.js');

const { create_admin } = await import('../lssb_functions/create_admin.js');

const { create_super_admin } = await import('../lssb_functions/create_super_admin.js');

const { auth_admin } = await import('../lssb_functions/auth_admin.js');

const { fetch_admins } = await import('../lssb_functions/fetch_admins.js');

const { update_admin } = await import('../lssb_functions/update_admin.js');

const { fetch_report } = await import('../lssb_functions/fetch_report.js');


const { initiate_reset_password } = await import('../lssb_functions/initiate_reset_password.js');

const { reset_admin_password } = await import('../lssb_functions/reset_admin_password.js');
const { create_institution } = await import('../lssb_functions/create_institution.js');
const { fetch_institutions } = await import('../lssb_functions/fetch_institutions.js');
const { delete_institution } = await import('../lssb_functions/delete_institution.js');

const initiate_admin_reset_password = initiate_reset_password;

const controller_fncs = {

    // create_account: user_create_account,
    // get_admin, 
    auth_admin,
    create_admin,
    update_admin,
    create_super_admin,
    fetch_admins,
    fetch_report,
    initiate_admin_reset_password,
    reset_admin_password,
    create_institution,
    fetch_institutions,
    delete_institution
};

// user_create_account = null;

// @@ user model declaration
let aNode = 'c1a' + Bun.argv[Bun.argv.indexOf('--node') + 1];

const controller_options = {
    collection: 'LSSB_admin',

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


const LSSB_admin_model = new SqyDB_Model({  // db: config._db,  
    collection: controller_options.collection,
    schema: controller_options.schema
});


const LSSB_institutions_model = new SqyDB_Model({
    collection: 'LSSB_institutions',
    schema: {}
});

// const cp_users_profiles_model = new SqyDB_Model({  // db: config._db,  
//     collection: 'LSSB_applications',
//     schema: {}
// });

// @@ Uset Controller
export let theController = async function (reqObj) {

    try {

        console.log(' LSSB Admin.js 179 hit --==>', reqObj.payloadData);

        if (!reqObj.payloadData && !reqObj.payloadData.cloud_action) {
            return { success: false, statusCode: 400, error: { msg: 'Cloud action missing' } }
        }

        // @@ -- Get Action to run 
        const { cloud_action } = reqObj.payloadData;
        delete reqObj.payloadData.cloud_action;

        let auth$ = null;
        let bad_true = false;

        if (typeof reqObj.auth == 'string' && reqObj.auth.length > 10) {

            auth$ = Crypto.decode(reqObj.auth);


            // @@ extra auth validation
            Object.keys(auth$).forEach(k => {

                if (bad_true) {
                    return
                }

                console.log('auth k ----->', k, k.indexOf('undefined') > -1, auth$[k].indexOf('undefined') > -1);

                if (k.indexOf('undefined') > -1 || auth$[k].indexOf('undefined') > -1) {

                    bad_true = true;
                }
            })
        }

        if (bad_true) {
            return { success: false, statusCode: 400, error: { msg: 'Invalid Authentication. Kindly log-in again' } }
        }

        if ( typeof reqObj.auth_expires == 'number'
            && typeof auth$ == 'object' && auth$ !== null
            && typeof auth$.timeSinceIssued == 'number' &&
            auth$.timeSinceIssued > reqObj.auth_expires

        ) {

            return { error: { msg: 'Expired Authorization. Kindly login again!!' }, statusCode: 401, success: false };
        }

        if (typeof controller_fncs[cloud_action] == 'function') {

            let cloud_response = await controller_fncs[cloud_action](reqObj, LSSB_admin_model, { utils, Crypto, aNode, auth$, institutions_model: LSSB_institutions_model });

            console.log('LSSB_admin.js 249 >>>> cloud_response --=>', cloud_response );
            return cloud_response

        }

        return { success: false, statusCode: 400, error: { msg: 'Invalid Cloud Action' } }

    } catch (error) {

        console.log(' -================================------->>>>>>>>>>>>>> Error performing OPs -====>', error);
        // await Bun.write('../error.txt', JSON.stringify(error) );
        return { success: false, statusCode: 500, error: { msg: `Error performing OPs` } }
    }

}


