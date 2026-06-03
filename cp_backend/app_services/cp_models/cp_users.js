let _route_options = {

    // db: 'champsDB',
    resource_name: "cp_user",
    collection: 'cpUser',

    // controller: qUsers_controller,
    // projections_after_set: ['token', 'msg', '_username' ],
    projections_after_set: ['msg', '_username', '_role', '_uid', '_email'],

    pre_set_ops: {
        'encrypt_data_keys': '_password',
        // 'generate_u_token': ['_email', '_username'],
        'generate_u_token': ['_username'],
        'generate_uid': '_username',
        'matching_values': [ { '_password': '_confirm_password' } ]
    },

    post_set_ops_: {
        'generate_encrypted_data': { 'token': ['_uid', 'role'] },
    },

    allowed_ops: [ // @@ Array of methods -- string or object.  

        // { 
        //     op: 'GET', 
        //     protected: ['_W_@s__5Tar__r_', 'admin__cp_'] 
        //     // protected: ['admin__cp_', 'user', 'any']  
        // }, 

        // 'GET', // this could then be protected for admin access wouldn't make sense to get all users
        // or -- protect it with systew, admin only.. then in authController, add sytem to role of getter tok

        // "GET_ONE", // for getting single.. wouldn't require long thins

        // 'SET',

        // 'RESET', // owner and system
        { 
            op: 'GET', 
            protected: ['_W_@s__5Tar__r_', 'admin__cp_', '$owner$', '$$cpSystem$$'] 
        },

        { 
            op: 'SET', 
            protected: ['_W_@s__5Tar__r_', 'admin__cp_', '$$cpSystem$$'] 
        },

        { 
            op: 'RESET', 
            protected: ['_W_@s__5Tar__r_', 'admin__cp_', '$$cpSystem$$'] 
        },
        // 'UNSET' // owner and system

        { 
            op: 'UNSET', 
            protected: ['_W_@s__5Tar__r_', 'admin__cp_', '$owner$', '$$cpSystem$$'] 
        },

        // { 
        //     op: 'UNSET', 
        //     protected: ['_W_@s__5Tar__r_', 'admin__cp_', 'owner'] 
        // } 

    ],

    index: ['content_key'],

    sorts: {
        createdOn: {},
    },

    schema: {

        firstname: { // @@ track progress
            type: ['string', 'String expected for Firstname'],
            default: 'NILL'
        },

        _email: {

            // type: ['number', 'Number expected for email'],
            type: ['string', 'String expected for email'],
            unique: [true, 'Email already exist!'],
            required: [true, 'Email is required'],
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email'
            ]
        },

        _username: {
            type: ['string', 'String expected for Username'],
            unique: [true, 'Username has been taken!'],
            required: [true, 'Username is Required']
        },

        isProfileComplete: { // @@ track progress
            type: ['string', 'String expected for profile Complete'],
            default: 'false'
        },

        profileId: { // @@ track progress
            type: ['string', 'String expected for profile ID'],
            default: 'null'
        },

        _role: {
            type: ['string', 'String expected for role'],
            // required: [true, 'Role is Required'],
            default: 'cpUser'
        },

        // _otp_: {
        //     type: ['string', 'String expected for role'],
        //     // required: [true, 'Role is Required'],
        //     unique: [true, 'Phone number already exist!'],
        // },
        _otp_: {
            type: ['schema_object', 'Object notation expected for OTP'],
            default: {}
        },

        // _address: {
        //     type: ['string', 'Invalid Address format'],
        //     default: 'NILL'
        // },
        _props: {
            type: ['schema_object', 'Object notation expected for _props'],
            default: {}
        },

        _password: {
            type: ['string', 'String expected for Password'],
            required: [true, 'Password is required'],
        },

        _u_token: { // unique token for password reset or auth refreshs.. replaces paasword token and refrsh token
            type: ['string', 'String expected for unique token'],
            required: [true, 'Kindly calc a Unique Token'],
        },

        // @@ refreshes front end Auth statte... gets updated 
        // on each call...
        // _refresh_token: {
        //     type: ['string', 'String expected for refresh_token'],
        //     required: [true, 'Kindly calc a refresh Token'],
        // },

        resource_type: {
            type: ['string', 'String expected for resource_type'],
            default: 'cp_user'
        },

        // .__creator_ important for sensitive resources
        _uid: {
            type: ['string', 'String expected for uid'],
            required: [true, 'Kindly calc a uid'],
        },

        _dn: { // data base node
            type: ['string', 'String expected for Database node'],
            default: 'A'
        },

        // @@ system metas
        // .__creator_ important for sensitive resources
        __creator_: {
            type: ['string', 'String expected for __creator_'],
            required: [true, 'Please provide this resource\'s creator'],
        },

        lastEditedBy: {
            type: ['string', 'String expected for lastEditedBy'],
            default: 'System_'
        },
    }
}