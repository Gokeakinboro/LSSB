const _u = require('../_lib_/utils');

const config = require('../config');

const Crypter = require('../_lib_/Crypter');
const Auther = require('../_lib_/Auther');

const Crypto = require('../_lib_/Crypto');

const SkyDB_Model = require('../_lib_/SkyDB_Model.class');

const entity_fncs = require('../cp_cloud_functions/entity_fncs');

const profile_fncs = require('../cp_cloud_functions/profile_fncs');

const posts_fncs = require('../cp_cloud_functions/posts_fncs');

const home_feed_fncs = require('../cp_cloud_functions/home_feed_fncs');

const cpUserOptions = require('../cp_controller_options/cp_users_options');


const cpUserProfileOptions = require('../cp_controller_options/cp_profiles');

const cpPostsOptions = require('../cp_controller_options/cp_posts');

const cp_comments_options = require('../cp_controller_options/cp_comments');

const cpConnections = require('../cp_controller_options/cp_connections');

const middleware = require('../_lib_/middleware');

// const otp_Options = require('./lssb_otp');


const { fork } = require('child_process');
const { type } = require('os');

// @@ auth_ controller uses use Schema

// @@ check that a supplied value is not undefined
let _und = function (value) { return typeof value == 'undefined' };

let cpUsersModel = new SkyDB_Model({  // db: config._db,  
    collection: cpUserOptions.collection,
    schema: cpUserOptions.schema
});

cpUserOptions.model = cpUsersModel;


let cpUserProfileModel = new SkyDB_Model({  // db: config._db,  
    collection: cpUserProfileOptions.collection,
    schema: cpUserProfileOptions.schema
});

cpUserProfileOptions.model = cpUserProfileModel;


let cpPostsModel = new SkyDB_Model({  // db: config._db,  
    collection: cpPostsOptions.collection,
    schema: cpPostsOptions.schema
});

cpPostsOptions.model = cpPostsModel;


let cp_comments_model = new SkyDB_Model({  // db: config._db,  
    collection: cp_comments_options.collection,
    schema: cp_comments_options.schema
});

cp_comments_options.model = cp_comments_model;


let cpConnectionsModel = new SkyDB_Model({  // db: config._db,  
    collection: cpConnections.collection,
    schema: cpConnections.schema
});

cpConnections.model = cpConnectionsModel;

// let otpModel = new SkyDB_Model({  // db: config._db,  
//     collection: otp_Options.collection,
//     schema: otp_Options.schema
// });


const rand_num_btw = function (num1, num2) {
    let rand = Math.floor((Math.random() * num2) + 1);
    // @@ ensure rand number is greater than num1 
    return rand <= num1 ? num1 + 1 : num1;
};

let validate_pass = function (val) {

    // console.log('valid pass --=>',  /^[A-Za-z0-9\_\@\(\)\#\*\\\|\{}[\]"'?/\$\!\~\,:;<>\`.=+%\^\-&]*$/.test(val), val );
    // 'val.indexOf(' ') == -1 &&',
    // /^[A-Za-z0-9_@()]*$/
    // /([^a-zA-Z0-9:\.\/\(\)\-\s])/

    // /([^a-zA-Z0-9:\.\/\(\)\-\S])/

    // return  /^[a-zA-Z0-9_@]+$/.test(val);
    return /^[A-Za-z0-9\_\@\(\)\#\*\\\|\{}[\]"'?/\$\!\~\,:;<>\`.=+%\^\-&]*$/.test(val)

};

// ( function () {

//     setTimeout( async function() {

//         console.log('just run ---------->');

//         let _password = Crypter.encode('78');


//         let $query = {};
//         $query.$where = {};
//         $query.find_one_from_many = true;

//         $query.$where['email'] = 'onedistrictone@gmail.com'; //reqObj.payloadData['email_for_reset'].trim();
//         $query.$where['otp'] = '087899';//reqObj.payloadData['otp_for_reset'].trim();

//         // @@ else perform pass reset
//         let reset_pass_res = await cpUsersModel.reset({ 
//             $query, 
//             // $where: $query.$where,
//             authorizedRoles: '$System$',
//             data: { _password },
//             __user_: { _uid: 'sysadmin', role: '$System$' } 
//         });

//         console.log('\n\n\n reset_pass_res -===============================>>>', reset_pass_res, $query );


//     }, 1000);


// }());


//##==== SET REQUEST -- Create Resource    
let set_controller = async function (Req_, options, authentication, authorizedRoles) {



    if (authentication && authorizedRoles.indexOf(authentication.role) == -1) {

        return _u.Response({ msg: 'User not authorized to create Resource' }, 401, false);

    }


    try {

        let data_to_save = Req_.payloadData;


        // @@ data processing
        // data_to_save = 

        if (Req_.hasFiles) {
            self_.process_files(Req_, data_to_save);
        }



        // @@ then set after files processed
        // data_to_save.__creator_ = authentication ? authentication.userData._uid : 'null';
        data_to_save.__creator_ = authentication ? authentication._uid : '$System$';
        // options

        // console.log(' shollay ===>>><<<>>', data_to_save, Req_.$query );
        // return _u.Response( { msg: 'testing' }, 200, true );

        // @@ ------- check here for file validation before saving

        //   db: 'qDB',
        //   collection: 'site_content',
        //   index: ['content_name'],
        // @@ run middleware operation on data
        if (options.pre_set_ops) {

            // console.log('pre_set_ops ---===>', options.pre_set_ops, data_to_save );
            options.middleware_op = options.pre_set_ops;
            data_to_save = middleware.fncs(data_to_save, options);

        }

        // console.log('pre_set_ops data_to_save ---===>', data_to_save );

        // @@ if an error occured during middleware preops
        if (data_to_save.isError) {

            return _u.Response({ msg: data_to_save.msg }, 400, false);
        }



        let set_res = await options.model.set(data_to_save);

        // console.log(' set_res ===>>>-----<<<>>', set_res, data_to_save );

        // @@ if it's an erro
        if (set_res.status && set_res.status == 'error' && set_res.response) {

            return _u.Response({ msg: set_res.response }, 400, false);

        };

        // @@ ------- move files for uploads here after setting
        if (set_res.response && set_res.response._id) {

            let data_to_return_after_set = { msg: set_res.response.msg, _id: set_res.response._id };

            // console.log('set_res 000 ->', set_res);

            // @@ do later abeg ---==-----

            // @@ run middleware operation on data
            if (options.post_set_ops_) {

                // console.log('pre_set_ops ---===>', options.pre_set_ops, data_to_save );
                options.middleware_op = options.post_set_ops_;
                data_to_return_after_set = middleware.fncs(data_to_save, options);
                data_to_return_after_set._id = set_res.response._id;

            }



            // if (options.post_set_CRUD && options.post_set_CRUD ) {

            // post_set_CRUD: {
            // 	'type': 'RESET',
            // 	// 'generate_encrypted_data': { 'token': ['_uid', '_username'] },
            // 	'update_collection': { // update collection after a set operation with some data
            // 		model: lgUsersModel,
            // 		data_key: 'isProfileComplete' 
            // 	}
            // },
            // }


            // @@ set projections here
            if (options.projections_after_set) {


                let proj = typeof options.projections_after_set == 'object' && typeof options.projections_after_set.length == 'number' ? options.projections_after_set : [options.projections_after_set];
                // let _d = set_res.response; 
                let _d = set_res.response;

                proj.push('_id');
                proj.push('msg');

                data_to_return_after_set = {};

                // console.log('options.projections_after_set ----->', options.projections_after_set, _d , data_to_save );

                proj.forEach(key => {

                    // console.log('keys ----->', key , _d[key], data_to_save[key], data_to_save );

                    if (_d[key]) {
                        data_to_return_after_set[key] = _d[key];
                    }

                    else if (data_to_save[key]) {
                        data_to_return_after_set[key] = data_to_save[key];
                    }

                });

            }



            if (Req_.hasFiles) {

                // console.log('Req_ -->', Req_ );


                // let file_upload_count = 0;
                self_.run_file_upload({ files_list: Req_.files_list, files: Req_.files, dir: config.uploadsDir, type: 'upload' });

                // @@ save file to uploads folder
                // Req_.files_list.forEach(async (file) => {

                // 	// console.log('Req_ -->', Req_.files[file].filepath);

                // 	let _o = await utils.uploadFile(Req_.files[file].filepath, Req_.files[file].name);
                // 	if (_o.msg == 'ok') { file_upload_count++ }

                // });

                // if (file_upload_count == Req_.files_list.length) {

                // 	// @@ send a response anyways
                // 	return {
                // 		success: true,
                // 		statusCode: 200,
                // 		data: { msg: set_res.response.msg, _id: set_res.response._id }
                // 	}
                // }

                // // @@ file didnt upload
                // return {
                // 	success: true,
                // 	statusCode: 200,
                // 	data: { msg: set_res.response.msg, _id: set_res.response._id }
                // }

            }

            // console.log('SET data_to_return_after_set ->', data_to_return_after_set );

            // @@ rest msg afreall
            data_to_return_after_set.msg = set_res.response.msg
            return _u.Response(data_to_return_after_set); // defaults 200, true
            // console.log('success 541  -->', data_to_return_after_set );


            // @@ send a response when no file
            // return {
            // 	success: true,
            // 	statusCode: 200,
            // 	data: data_to_return_after_set
            // }
        }

        else {

            return {
                success: false,
                statusCode: 500,
                data: { msg: 'Error creating Resource . Please try again!' }
            }
        }



        // console.log('controller working ---');
        // return setResponse(200, true, { msg: set_res.response.msg, _id: set_res.response._id });

    }

    // @@ catch server errors
    catch (err) {

        console.log('SET err', err);
        return _u.Response({ error: `Error creating resource` }, 500, false);
    }

};
// END SET Request --- //


// https://www.freecodecamp.org/news/how-to-shuffle-an-array-of-items-using-javascript-or-typescript/
// https://www.samanthaming.com/tidbits/49-2-ways-to-merge-arrays/
const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// @@ Create Acc Controller
let account_controller = async function (reqObj) {

    // console.log('auth_ reqObj --->', reqObj);
    // let mainKey = '', theResponse = {};

    try {


        console.log('----> payload 94 ', reqObj.payloadData );

        if (!reqObj.payloadData.cp_fnc) {

            return _u.Response({ msg: 'Invalid Function!!' }, 400, false);
        }


        if ( reqObj.payloadData.cp_fnc == 'create_entity' || reqObj.payloadData.cp_fnc == 'fetch_user_entity' ) {

            let res = await entity_fncs(reqObj, set_controller);
            return res
        }

        if ( reqObj.payloadData.cp_fnc == 'get_self_profile' || reqObj.payloadData.cp_fnc == 'get_user_profile' ) {

            let res = await profile_fncs(reqObj, set_controller);
            return res
        }

        if (reqObj.payloadData.cp_fnc == 'publish_post' || reqObj.payloadData.cp_fnc == 'edit_post' ) {

            let res = await posts_fncs(reqObj, set_controller);
            return res
        }

        if (reqObj.payloadData.cp_fnc == 'get_home_feed') {



            let res = await home_feed_fncs(reqObj, set_controller);
            return res


        }


        if (reqObj.payloadData.cp_fnc == 'get_feed') {


            let $query = {}, decoded_auth = {};
            if (typeof reqObj.auth == 'string' && reqObj.auth.length > 10) {

                decoded_auth = Crypto.decode(reqObj.auth);
                
                $query.$limit = 2;
                $query.$skip = ( reqObj.payloadData.skip * 2 );

            }

            else {

                $query.$limit = 4;

            }



            // @@ get many
            let get_res = await cpPostsModel.get($query);

            console.log(

                ' GET Cp Posts 009 response  n -=----=====---><><>>>>>>> ',
                get_res, ' cpPostsOptions.allowed_ops[2].protected ',
                get_res.data

            );

            if (get_res.response) {

                if (get_res.response.data.length < 1) {

                    return { success: true, statusCode: 404, data: { msg: `null` } }
                }

                // console.log('get_res.response.data.data ===>', get_res.response.data );
                get_res.response.data = shuffle(get_res.response.data);

                // @@ else return posts
                return _u.Response(get_res.response.data, 200, true);

            }


            // return _u.Response( { msg: `Still working....` }, 200, true );

            // if ( get_res.data) {


            //     // @@ Generate a token for sending back;

            //     return _u.Response(_d, 200, true);


            // }

            // @@ -- if no response -- retry
            let em_ = 'Error Fetching Feed';
            return _u.Response({ msg: `${get_res.data && get_res.data.msg ? get_res.data.msg : em_}` }, 400, false);


        }


       


        if (reqObj.payloadData.cp_fnc == 'get_posts$') {


            // let $query = {}, decoded_auth = {};
            // if (typeof reqObj.auth == 'string' && reqObj.auth.length > 10) {

            //     decoded_auth = Crypto.decode(reqObj.auth);
            //     $query.$limit = 50;
            // }

            // else {
            //     $query.$limit = 4;
            // }

            // console.log('reqObj reqObj -->', reqObj);
            // @@ get many
            let get_res = await cpPostsModel.get(reqObj.$query);

            // console.log(

            //     ' GET Cp Posts 009 response  n -=----=====---><><>>>>>>> ',
            //     get_res, ' cpPostsOptions.allowed_ops[2].protected ',
            //     get_res.data

            // );

            if (get_res.response) {

                if (get_res.response.data.length < 1) {

                    return { success: true, statusCode: 400, data: { msg: `null` } }
                }

                // console.log('get_res.response.data.data ===>', get_res.response.data );
                get_res.response.data = shuffle(get_res.response.data);

                // @@ else return posts
                return _u.Response(get_res.response.data, 200, true);

            }


            // return _u.Response( { msg: `Still working....` }, 200, true );

            // if ( get_res.data) {


            //     // @@ Generate a token for sending back;

            //     return _u.Response(_d, 200, true);


            // }

            // @@ -- if no response -- retry
            let em_ = 'Error Fetching Posts';
            return _u.Response({ msg: `${get_res.data && get_res.data.msg ? get_res.data.msg : em_}` }, 400, false);


        }

        if (reqObj.payloadData.cp_fnc == 'show_user_connections') {

            let decoded_auth = null;
            if (typeof reqObj.auth == 'string' && reqObj.auth.length > 10) {

                decoded_auth = Crypto.decode(reqObj.auth);
            }

            if (typeof config.auth_expires == 'number'
                && typeof decoded_auth == 'object' && decoded_auth !== null
                && typeof decoded_auth.timeSinceIssued == 'number' &&
                decoded_auth.timeSinceIssued > config.auth_expires) {

                return _u.Response({ msg: 'Expired Authorization. Kindly login again!!' }, 401, false);
            }

            // console.log(' Get profile --->', '-============== dat -===>', reqObj.payloadData, reqObj.$query );

            // let get_res = await cpUserProfileModel.get({
            //     get_many_from_key: {
            //         __creator_: decoded_auth._uid,
            //         key: 'connections_track.following',
            //         value_type: '__creator_',
            //         value_collection: 'cpUserProfiles',
            //         value_projections: ['fullname', '_id', '__creator_', 'profilePhoto', 'connections', 'connections_track']
            //     }
            // });
            // xApp.running_api_ops = false;
            let conn_type = reqObj.payloadData.type;


            let get_res = await cpUserProfileModel.get({
                $where: {
                    __creator_: reqObj.payloadData.uid,
                    find_one_from_many: true,
                }
            });

            // console.log(

            //     ' GET User following -- followers cloud fnc 534 response  n -=----=====---><><>>>>>>> ',
            //     get_res,

            // );

            if (get_res.response) {

                if (get_res.response.data.length < 1) {

                    return { success: true, statusCode: 404, data: { msg: `User not found` } }
                }

                // @@ else process connection
                let d_ = get_res.response.data[0][0] || get_res.response.data[0];

                let reqUserConnKeys = d_.connections_track[conn_type]; 

                // console.log(
                //     ' GET User following -- d_ -=----=====---><><>>>>>>> ',
                //     d_.connections_track.following,
                // );

                d_ = null;

                reqUserConnKeys = reqUserConnKeys.split('~~');
                let dvl = reqUserConnKeys.length;

                let get_many_keys = [];

                // let col = options.get_many_from_key.value_collection;

                for (let iv = 0; iv < dvl; iv++) {

                    const element = reqUserConnKeys[iv];
                    if (element.length > 3) { 
                        get_many_keys.push(element);
                    }

                }

                let get_many_res = await cpUserProfileModel.getMany({
                    // $where: {
                    //     __creator_: reqObj.payloadData.uid,
                    // },
                    index_key: '__creator_',
                    get_many_keys,
                    $projection: ['_id', 'fullname', 'displayPhoto','__creator_', 'connections']
                });

                console.log(
                    ' GET User following -- d_ -=----=====---><><>>>>>>> ',
                    // get_many_keys,
                    get_many_res.response.data
                );


                return _u.Response({ msg: 'OK__', data: get_many_res.response.data }, 200, true);

            }

            // return _u.Response( { msg: 'Comment Added' }, 200, true);

            return _u.Response({ msg: 'Error fetching followings' }, 500, false);


        }



        // @@ -- If Action === get_discovery_feed
        if (reqObj.payloadData.cp_fnc == 'get_user_connection') {

            let decoded_auth = null;
            if (typeof reqObj.auth == 'string' && reqObj.auth.length > 10) {

                decoded_auth = Crypto.decode(reqObj.auth);
            }

            if (typeof config.auth_expires == 'number'
                && typeof decoded_auth == 'object' && decoded_auth !== null
                && typeof decoded_auth.timeSinceIssued == 'number' &&
                decoded_auth.timeSinceIssued > config.auth_expires

            ) {

                return _u.Response({ msg: 'Expired Authorization. Kindly login again!!' }, 401, false);
            }


            // let set_comment_res = await set_controller(
            //     reqObj,
            //     cp_comments_options, { _uid: decoded_auth._uid, role: '$$cpSystem$$' },
            //     cp_comments_options.allowed_ops[1].protected
            // );
            // reqObj.payloadData.profile_uid
            let $query = {
                $where: { object_id: decoded_auth._uid }
            };

            // console.log(' Add comment --->', set_comment_res, '-============== add comm dat -===>', reqObj.payloadData );

            let get_res = await cpConnectionsModel.get($query);

            // console.log(

            //     ' GET Cp Users Connections 0089 response  n -=----=====---><><>>>>>>> ',
            //     get_res, ' cpPostsOptions.allowed_ops[2].protected ',
            //     get_res.response.data[0]

            // );

            if (get_res.response) {

                if (get_res.response.data.length < 1) {

                    return { success: true, statusCode: 404, data: { msg: `null` } }
                }

                // @@ else return posts
                return _u.Response(get_res.response.data, 200, true);

            }

            // return _u.Response( { msg: 'Comment Added' }, 200, true);

            return _u.Response({ msg: 'Error getting user connections ' }, 500, false);

        }

        // @@ -- If Action === get_discovery_feed
        if (reqObj.payloadData.cp_fnc == 'get_discovery_feed') {

            let decoded_auth = null;
            if (typeof reqObj.auth == 'string' && reqObj.auth.length > 10) {

                decoded_auth = Crypto.decode(reqObj.auth);
            }

            if (typeof config.auth_expires == 'number'
                && typeof decoded_auth == 'object' && decoded_auth !== null
                && typeof decoded_auth.timeSinceIssued == 'number' &&
                decoded_auth.timeSinceIssued > config.auth_expires

            ) {

                return _u.Response({ msg: 'Expired Authorization. Kindly login again!!' }, 401, false);
            }


            // let set_comment_res = await set_controller(
            //     reqObj,
            //     cp_comments_options, { _uid: decoded_auth._uid, role: '$$cpSystem$$' },
            //     cp_comments_options.allowed_ops[1].protected
            // );
            let $query = {
                $limit: 100
            };

            // console.log(' Add comment --->', set_comment_res, '-============== add comm dat -===>', reqObj.payloadData );

            let get_res = await cpUserProfileModel.get($query);

            // console.log(

            //     ' GET Cp Users 0089 response  n -=----=====---><><>>>>>>> ',
            //     get_res, ' cpPostsOptions.allowed_ops[2].protected ',
            //     get_res.data

            // );

            if (get_res.response) {

                if (get_res.response.data.length < 1) {

                    return { success: true, statusCode: 404, data: { msg: `No Users found` } }
                }

                // @@ else return posts
                return _u.Response(get_res.response.data, 200, true);

            }

            // return _u.Response( { msg: 'Comment Added' }, 200, true);

            return _u.Response({ msg: 'Error adding comment' }, 500, false);

        }


        // @@ -- If Action === follow user
        if (reqObj.payloadData.cp_fnc == 'update_user_profile') {

            let decoded_auth = null;
            if (typeof reqObj.auth == 'string' && reqObj.auth.length > 10) {

                decoded_auth = Crypto.decode(reqObj.auth);
            }

            if (typeof config.auth_expires == 'number'
                && typeof decoded_auth == 'object' && decoded_auth !== null
                && typeof decoded_auth.timeSinceIssued == 'number' &&
                decoded_auth.timeSinceIssued > config.auth_expires

            ) {

                return _u.Response({ msg: 'Expired Authorization. Kindly login again!!' }, 401, false);
            }


            delete reqObj.payloadData['action'];

            delete reqObj.payloadData['cp_fnc'];

            let $object_query = {};
            $object_query.$where = {};
            $object_query.find_one_from_many = true;

            $object_query.$where['__creator_'] = decoded_auth._uid;


            let upddate_profile_res = await cpUserProfileModel.reset({
                $where: $object_query.$where,
                authorizedRoles: '$$cpSystem$$',
                // data: { verified: 'true'},
                data: reqObj.payloadData,
                __user_: { _uid: decoded_auth._uid, role: '$$cpSystem$$' }
            });

            console.log('upddate_profile_res ====--->', upddate_profile_res);

            if (upddate_profile_res.msg == 'done') {


                // @@ -- if it's an email update
                if (reqObj.payloadData._email || reqObj.payloadData._firstname) {


                    let data = {};

                    if (reqObj.payloadData._email) {

                        data._email = reqObj.payloadData._email;
                    }

                    if (reqObj.payloadData._firstname) {

                        data._firstname = reqObj.payloadData._firstname;
                    }

                    // @@ set email on user verified here
                    let reset_user_email_res = await cpUsersModel.reset({
                        // $query, 
                        $where: { _uid: decoded_auth._uid },
                        authorizedRoles: '$System$',
                        data,
                        __user_: { _uid: decoded_auth._uid, role: '$$cpSystem$$' }
                    });

                    console.log('Reset options --===>', reset_user_email_res);

                    if (reset_user_email_res.success && reset_user_email_res.msg == 'done') {

                        return _u.Response({ msg: 'OK_' }, 200, true);
                    }

                    return _u.Response({ msg: 'Error Updating details completely' }, 200, false);

                }


                // @@ run background update of posts by this user if payloadData contains
                // fullname, profilePhoto


                // @@ -- if no response -- retry
                return _u.Response({ msg: 'OK_' }, 200, true);

            }

            return _u.Response({ msg: 'Error updating details' }, 500, false);


        }

        // @@ -- If Action === follow user
        if (reqObj.payloadData.cp_fnc == 'follow_user') {


            let decoded_auth = null;
            if (typeof reqObj.auth == 'string' && reqObj.auth.length > 10) {

                decoded_auth = Crypto.decode(reqObj.auth);
            }

            if (typeof config.auth_expires == 'number'
                && typeof decoded_auth == 'object' && decoded_auth !== null
                && typeof decoded_auth.timeSinceIssued == 'number' &&
                decoded_auth.timeSinceIssued > config.auth_expires

            ) {

                return _u.Response({ msg: 'Expired Authorization. Kindly login again!!' }, 401, false);
            }



            let the_follower = decoded_auth._uid;

            let the_followed = reqObj.payloadData['subject_id'];

            let the_action = reqObj.payloadData['action'];

            if (the_follower == the_followed) {
                return _u.Response({ msg: 'Can\'t follow self' }, 400, false);
            }

            delete reqObj.payloadData['action'];

            delete reqObj.payloadData['cp_fnc'];

            let $object_query = {};
            $object_query.$where = {};
            $object_query.find_one_from_many = true;

            $object_query.$where['__creator_'] = the_follower;


            let subject_query = {};
            subject_query.$where = {};
            subject_query.find_one_from_many = true;

            subject_query.$where['__creator_'] = the_followed;


            // @@ set following on object user
            let data_o = {};

            if (the_action == 'follow') {

                data_o['$add'] = { 'connections.following': 1 };
                // data_o['$push'] = { 'connections_track.following': set_follow_connection_res.data._id };
                data_o['$add_string'] = { 'connections_track.following': the_followed + '~~' };

            }

            else {
                data_o['$add'] = { 'connections.following': -1 }
                data_o['$remove_string'] = { 'connections_track.following': the_followed + '~~' };
            }

            let set_connection_on_object_profile_res = await cpUserProfileModel.reset({
                $where: $object_query.$where,
                authorizedRoles: '$$cpSystem$$',
                // data: { verified: 'true'},
                data: data_o,
                __user_: { _uid: 'sysadmin', role: '$$cpSystem$$' }
            });

            if (set_connection_on_object_profile_res.msg == 'done') {

                let data_s = {};

                if (the_action == 'follow') {

                    data_s['$add'] = { 'connections.followers': 1 };
                    data_o['$add_string'] = { 'connections_track.followers': the_follower + '~~' };

                }

                else {
                    data_s['$add'] = { 'connections.followers': -1 }
                    data_o['$remove_string'] = { 'connections_track.followers': the_follower + '~~' };
                }

                let set_connection_on_subject_profile_res = await cpUserProfileModel.reset({
                    $where: subject_query.$where,
                    authorizedRoles: '$$cpSystem$$',
                    // data: { verified: 'true'},
                    data: data_s,
                    __user_: { _uid: 'sysadmin', role: '$$cpSystem$$' }
                });

                if (set_connection_on_subject_profile_res.msg == 'done') {

                    return _u.Response({ msg: 'OK__' }, 200, true)

                }

                return _u.Response({ msg: 'Error setting connection' }, 500, false);

            }


            return _u.Response({ msg: 'Error setting connection' }, 500, false);

        }


        // cp_comments_model

        // @@ -- If Action === add_comm
        if (reqObj.payloadData.cp_fnc == 'add_post_comment') {

            let decoded_auth = null;
            if (typeof reqObj.auth == 'string' && reqObj.auth.length > 10) {

                decoded_auth = Crypto.decode(reqObj.auth);
            }

            if (typeof config.auth_expires == 'number'
                && typeof decoded_auth == 'object' && decoded_auth !== null
                && typeof decoded_auth.timeSinceIssued == 'number' &&
                decoded_auth.timeSinceIssued > config.auth_expires

            ) {

                return _u.Response({ msg: 'Expired Authorization. Kindly login again!!' }, 401, false);
            }


            // @@@ 1. first save the comment to it's collection


            let set_comment_res = await set_controller(
                reqObj,
                cp_comments_options, { _uid: decoded_auth._uid, role: '$$cpSystem$$' },
                cp_comments_options.allowed_ops[1].protected
            );

            // console.log(' Add comment --->', set_comment_res, '-============== add comm dat -===>', reqObj.payloadData);

            // return _u.Response({ msg: 'Comment Added' }, 200, true);

            if (set_comment_res.success && set_comment_res.data) {


                // @@@ 2. if success , save to connections cloud

                // -- if more than 100k per conn cloud item... create a new one.. else set on exist one
                // -- derive this by checking count =  

                // ----------- first check if this posts has connections of this type set first set for 
                let check_exist = await cpConnectionsModel.get({
                    $where: {
                        type: 'comments',
                        object_id: reqObj.payloadData['parent_resource_id'],
                    }
                });


                // console.log('check_exist -->', check_exist.response.data, check_exist.response.data[0] )


                if (check_exist.response.data && check_exist.response.data.length > 0) {

                    let last_one = check_exist.response.data.length - 1;

                    let update_existing_conn_res = await cpConnectionsModel.reset({
                        $where: { _id: check_exist.response.data[last_one]._id },
                        authorizedRoles: '$$cpSystem$$',
                        // data: { verified: 'true'},
                        data: {

                            $add_string: { subject_id: decoded_auth._uid }
                        },
                        __user_: { _uid: 'sysadmin', role: '$$cpSystem$$' }
                    });


                    console.log('update_existing_conn_res --->', update_existing_conn_res)


                    if (update_existing_conn_res.msg == 'done') {

                        let $query = {};
                        $query.$where = {};
                        $query.find_one_from_many = true;

                        $query.$where['_id'] = reqObj.payloadData['parent_resource_id'];

                        // delete reqObj.payloadData['post_id'];
                        // $query.$add = reqObj.payloadData['$add'];


                        let set_response_on_post_res = await cpPostsModel.reset({
                            $where: $query.$where,
                            authorizedRoles: '$$cpSystem$$',
                            // data: { verified: 'true'},
                            data: {
                                $push: {
                                    responses: {

                                        _id: set_comment_res.data._id,
                                        responseText: reqObj.payloadData.responseText,
                                        responseAuthor: {
                                            profilePhoto: reqObj.payloadData['responseAuthor.profilePhoto'],
                                            fullname: reqObj.payloadData['responseAuthor.fullname'],
                                            _id: reqObj.payloadData['responseAuthor._id']
                                        },
                                    }
                                },

                                $push_max$: 3,
                                $add: { 'connections.comment_count': 1 },
                                // $push2: { 'connections_track.comment_count': set_connection_res.data._id }
                                // -- no need to push again... ther already
                                // push2 for when push as max already to avoid conflick
                            },
                            __user_: { _uid: 'sysadmin', role: '$$cpSystem$$' }
                        });


                        // console.log(' Add comment ---> ', set_connection_res, set_response_on_post_res, '-============== add comm dat -===>', 'reqObj.payloadData' );

                        // return _u.Response({ msg: 'Comment Added' }, 200, true);

                        if (set_response_on_post_res.msg == 'done') {

                            return _u.Response({ msg: 'OK__' }, 200, true)
                        }


                        return _u.Response({ msg: 'Error adding comment 3' }, 500, false);
                    }

                    return _u.Response({ msg: 'Error adding comment 775' }, 500, false);

                }

                else {

                    let set_connection_res = await set_controller(
                        {
                            payloadData: {
                                type: 'comments',
                                object_id: reqObj.payloadData['parent_resource_id'],
                                subject_id: decoded_auth._uid + '~~'
                            }
                        },
                        cpConnections, { _uid: decoded_auth._uid, role: '$$cpSystem$$' },
                        cpConnections.allowed_ops[1].protected
                    );


                    if (set_connection_res.success && set_connection_res.data) {

                        // @@@ 3. if success , increase comment count on owner Post


                        let $query = {};
                        $query.$where = {};
                        $query.find_one_from_many = true;

                        $query.$where['_id'] = reqObj.payloadData['parent_resource_id'];

                        // delete reqObj.payloadData['post_id'];
                        // $query.$add = reqObj.payloadData['$add'];


                        let set_response_on_post_res = await cpPostsModel.reset({
                            $where: $query.$where,
                            authorizedRoles: '$$cpSystem$$',
                            // data: { verified: 'true'},
                            data: {
                                $push: {
                                    responses: {

                                        _id: set_comment_res.data._id,
                                        responseText: reqObj.payloadData.responseText,
                                        responseAuthor: {
                                            profilePhoto: reqObj.payloadData['responseAuthor.profilePhoto'],
                                            fullname: reqObj.payloadData['responseAuthor.fullname'],
                                            _id: reqObj.payloadData['responseAuthor._id']
                                        },
                                    }
                                },

                                $push_max$: 3,
                                $add: { 'connections.comment_count': 1 },
                                $push2: { 'connections_track.comment_count': set_connection_res.data._id }
                                // push2 for when push as max already to avoid conflick
                            },
                            __user_: { _uid: 'sysadmin', role: '$$cpSystem$$' }
                        });


                        console.log(' Add comment ---> ', set_connection_res, set_response_on_post_res, '-============== add comm dat -===>', 'reqObj.payloadData');

                        // return _u.Response({ msg: 'Comment Added' }, 200, true);

                        if (set_response_on_post_res.msg == 'done') {

                            return _u.Response({ msg: 'OK__' }, 200, true)
                        }


                        return _u.Response({ msg: 'Error adding comment 3' }, 500, false);

                    }





                }





                // if (set_connection_res.success && set_connection_res.data) {

                //     return _u.Response({ msg: 'OK__' }, 200, true)
                // }

                // console.log(' \n\n ----- \n set_ post comment -============== -->', set_response_on_post_res);





                return _u.Response({ msg: 'Error adding comment 2' }, 500, false);

            }


            return _u.Response({ msg: 'Error adding comment 1' }, 500, false);

        }


        // @@ -- If Action === set post like
        if (reqObj.payloadData.cp_fnc == 'post_like') {


            let decoded_auth = null;
            if (typeof reqObj.auth == 'string' && reqObj.auth.length > 10) {

                decoded_auth = Crypto.decode(reqObj.auth);
            }

            if (typeof config.auth_expires == 'number'
                && typeof decoded_auth == 'object' && decoded_auth !== null
                && typeof decoded_auth.timeSinceIssued == 'number' &&
                decoded_auth.timeSinceIssued > config.auth_expires

            ) {

                return _u.Response({ msg: 'Expired Authorization. Kindly login again!!' }, 401, false);
            }


            let $query = {};
            $query.$where = {};
            $query.find_one_from_many = true;

            $query.$where['_id'] = reqObj.payloadData['post_id'].trim();

            let post_id = reqObj.payloadData['post_id'];

            let like_or_unlike = reqObj.payloadData['$add']['connections.likes_count'];

            delete reqObj.payloadData['post_id'];

            // $query.$add = reqObj.payloadData['$add'];

            let set_like_on_post_res = await cpPostsModel.reset({
                $where: $query.$where,
                authorizedRoles: '$$cpSystem$$',
                // data: { verified: 'true'},
                data: reqObj.payloadData,
                __user_: { _uid: 'sysadmin', role: '$$cpSystem$$' }
            });

            // let set_profile_res = await set_controller(
            //     reqObj,
            //     cpUserProfileOptions, { _uid: decoded_auth._uid, role: '$$cpSystem$$' },
            //     cpUserProfileOptions.allowed_ops[1].protected
            // );

            // console.log(' \n\n ----- \n set_like_on_post_res -============== -->', set_like_on_post_res);
            // @@ update in connection... post like..
            // for unlike.. remove connection type post_like with this user id and post_id
            if (set_like_on_post_res.msg == 'done') {


                // @@ ------------------- set connection ------------------ //

                // ---- connection post_like_read between an user and a post (subect)
                // user _uid and post._id

                // ----------- first check if this posts has connections of this type set first set for 
                let check_exist = await cpConnectionsModel.get({
                    $where: {
                        type: 'post_like_read',
                        object_id: reqObj.payloadData['$object_uid'],
                    }
                });

                // console.log('check_exist -->', check_exist.response.data, check_exist.response.data[0] )

                // @@ if connection count is greater than 100k or 10k or whatever you feel is performant

                if (check_exist.response.data && check_exist.response.data.length > 0) {

                    let last_one = check_exist.response.data.length - 1;

                    let data_ = {};

                    if (like_or_unlike === 1) {
                        data_['$add_string'] = { subject_id: post_id }
                    }

                    else {
                        data_['$remove_string'] = { subject_id: post_id }
                    }

                    let update_existing_conn_res = await cpConnectionsModel.reset({
                        $where: { _id: check_exist.response.data[last_one]._id },
                        authorizedRoles: '$$cpSystem$$',
                        // data: { verified: 'true'},
                        data: data_,
                        __user_: { _uid: 'sysadmin', role: '$$cpSystem$$' }
                    });

                    console.log(' update_existing_conn_res --====----> ', update_existing_conn_res);

                    // @@ now update action object user profile with connection _id
                    if (update_existing_conn_res.msg == 'done') {

                        let $query = {};
                        $query.$where = {};
                        $query.find_one_from_many = true;

                        $query.$where['__creator_'] = reqObj.payloadData['$object_uid'];

                        // delete reqObj.payloadData['post_id'];
                        // $query.$add = reqObj.payloadData['$add'];
                        // connections_track.likes_coun
                        // connections_track
                        let data_ = {};

                        if (like_or_unlike === 1) {
                            data_['$push'] = { 'connections_track.post_like_read': check_exist.response.data[last_one]._id };
                            data_['$add'] = { 'connections.post_like_read': like_or_unlike };
                        }

                        else {

                            data_['$add'] = { 'connections.post_like_read': like_or_unlike };

                            // @@ if it's less han 100k... remove id from here connections_track.post_like_read
                        }

                        let set_response_on_acting_prof_res = await cpUserProfileModel.reset({
                            $where: $query.$where,
                            authorizedRoles: '$$cpSystem$$',
                            // data: { verified: 'true'},
                            data: data_,
                            __user_: { _uid: 'sysadmin', role: '$$cpSystem$$' }
                        });


                        // console.log(' like post prof ---> ', set_connection_res, set_response_on_post_res, '-============== add comm dat -===>', 'reqObj.payloadData' );

                        if (set_response_on_acting_prof_res.msg == 'done') {

                            return _u.Response({ msg: 'OK__' }, 200, true)
                        }

                        return _u.Response({ msg: 'Error liking post 3' }, 500, false);

                    }

                    return _u.Response({ msg: 'Error post liking 986' }, 500, false);

                }

                else {

                    let set_connection_res = await set_controller(
                        {
                            payloadData: {
                                type: 'post_like_read',
                                object_id: reqObj.payloadData['$object_uid'],
                                subject_id: post_id + '~~'
                            }
                        },
                        cpConnections, { _uid: decoded_auth._uid, role: '$$cpSystem$$' },
                        cpConnections.allowed_ops[1].protected
                    );


                    if (set_connection_res.success && set_connection_res.data) {

                        // @@@ 3. if success , increase comment count on owner Post

                        let $query = {};
                        $query.$where = {};
                        $query.find_one_from_many = true;

                        $query.$where['__creator_'] = reqObj.payloadData['$object_uid'];

                        // delete reqObj.payloadData['post_id'];
                        // $query.$add = reqObj.payloadData['$add'];
                        // connections_track.likes_coun
                        // connections_track
                        let data_ = {};

                        if (like_or_unlike === 1) {
                            data_['$push'] = { 'connections_track.post_like_read': set_connection_res.data._id };
                            data_['$add'] = { 'connections.post_like_read': like_or_unlike };
                        }

                        else {

                            data_['$add'] = { 'connections.post_like_read': like_or_unlike };

                            // @@ if it's less han 100k... remove id from here connections_track.post_like_read
                        }

                        let set_response_on_acting_prof_res = await cpUserProfileModel.reset({
                            $where: $query.$where,
                            authorizedRoles: '$$cpSystem$$',
                            // data: { verified: 'true'},
                            data: data_,

                            // {
                            //     $push: {
                            //         'connections_track.post_like_read': set_connection_res.data._id
                            //     },

                            //     // $push_max$: 3,
                            //     $add: { 'connections.post_like_read': like_or_unlike },
                            //     // $push2: { 'connections_track.comment_count': set_connection_res.data._id }
                            //     // -- no need to push again... ther already
                            //     // push2 for when push as max already to avoid conflick
                            // },
                            __user_: { _uid: 'sysadmin', role: '$$cpSystem$$' }
                        });


                        // console.log(' like post prof ---> ', set_connection_res, set_response_on_post_res, '-============== add comm dat -===>', 'reqObj.payloadData' );

                        if (set_response_on_acting_prof_res.msg == 'done') {

                            return _u.Response({ msg: 'OK__' }, 200, true)
                        }

                        return _u.Response({ msg: 'Error liking post 3' }, 500, false);

                    }





                }


                // @@ ----------- end set connection ---------------------------------------//


                // return _u.Response({ msg: 'OK__' }, 200, true);

            }

            else {
                return _u.Response({ msg: 'Error Liking Post' }, 500, false);
            }

            return

        }



        // @@ -- create user and return token



        // mainKey = reqObj.payloadData['auth_user_email'].indexOf('@') > -1 ? '_email' : '_username';

        // console.log('cpUsersModel -->', cpUsersModel);

        /**
         * @descrp if it's a protected
         * @param {string} [ options.name='']
         */

        // @@ check that payload is a refresh token request -- re auth with a nu token then save in frontend 
        // -- for persistent states
        // if (typeof reqObj.data['_rft'] == 'string') { 

        // @@ get many
        // let get_res = await options.model.get(Req_.$query);

        // }
        // let $query = {};
        // $query.$where = {};
        // $query.$where[mainKey] = reqObj.payloadData['auth_user_email'].trim();

        // $query.find_one_from_many = true;
        //{

        // $limit: options.limit || 10,
        // $limit: 1,
        // 	// $skip: options.skip || 0,
        // $where: { content_key: 'mission-vision'},
        // $where: { _username: 'vicman4', "_email":"v@vv.neth" }, //_password: '1234'

        // 	$projection: ['_id', 'sex','email', 'fullname', 'resource_type',
        // 	'academic_details.school', 'academic_details.course', 
        // 	'academic_details.matric_no', 'bank_details.bank', 'passport_image',
        // 	 'bank_details.account_name', 'bank_details.account_number' ],

        // 	$where: { '_id': 'options.rid' },
        // $where: { 'academic_details.school': 'gogo' },

        // } 




        // let get_res = await cpUsersModel.set($query);
        let set_res = await set_controller(reqObj, cpUserOptions, { _uid: '$$cpSystem$$', role: '$$cpSystem$$' }, cpUserOptions.allowed_ops[1].protected);

        console.log(

            ' set 009 response  n -=----=====---><><>>>>>>> ',
            set_res, ' cpUserOptions.allowed_ops[2].protected ',
            set_res.data

        );

        // return _u.Response( { msg: `Still working....` }, 200, true );

        if (set_res.success && set_res.data) {

            // console.log('Auth get -->', get_res, $query );
            // let foundData = get_res.response.data.length > 0;

            // if (set_res.response.data.length < 1) {

            //     return { success: true, statusCode: 400, data: { msg: "User not Found" } }
            // }


            // let userData = get_res.response.data[0];

            // console.log('userData -->', userData );

            // @@ Generate a token for sending back;
            // let { firstname, _username, _email, _uid, _role, _password, _u_token, isProfileComplete, _id } = userData;
            let { _username, _uid, _role, _id, _email } = set_res.data;

            // console.log('token is:', token, RamDB.toks, RamDB.numusers);
            // let _password_ = Crypter.decode(_password);
            // let uPass = reqObj.payloadData.auth_password;


            // console.log('pass__:', uPass, _password_);

            // @@ run a password check
            // if (uPass !== '&*&The_big_lag_master_password_to_use_tomorrow%$!@' && uPass !== _password_) {
            //     let mainkey_ = mainKey.replace('_', ' ');
            //     return _u.Response({ msg: 'Invalid ' + mainkey_ + ' or password' }, 400, false);
            // }

            // _password_ = null;
            // uPass = null;

            // @@ else 

            // console.log('the auth result', theResult );
            let token = Auther.encode({ _uid, role: _role });

            // isProfileComplete = isProfileComplete || 'false';

            // console.log('Toker rev ---->', token, ' --====--->', Auther.decode(token), isProfileComplete);
            // @@ return token to frontEnd
            // let _d = { _id, firstname, token, _username, _u_token, _email, isProfileComplete, msg: 'Sign-in Successfull' };
            let _d = { _id, token, _email, _username, isProfileComplete: 'false', msg: 'Account Created!!' };
            // let _d = { token, _username, _r: _role, _u_token, made_pay_, msg: 'Sign-in Successfull' };
            return _u.Response(_d, 200, true);


            // @@ return the generated token for frontEnd Auth
            //  let data = { username, refresh_token, email, token, role, made_pay_, msg: 'Sign In successfull' };
            //  data[mainkey] = theResult[mainkey];

            //  // @@ -- find id of the owners application profile where email and username matches provided one from
            //  // -- results above
            //  let theOtherResource = await qProfilesModel.findOne({__creator_: _uid}, { _id: 1, profile_photo: 1 });

            //  // console.log( 'theOtherResource ==>', theOtherResource );

            //  if ( theOtherResource && theOtherResource._id ) {

            //      data.other_id = theOtherResource._id;
            //      data.profile_photo = theOtherResource.profile_photo;

            //      // @@ send step back too for frontend
            //      // data.step = theOtherResource.step;

            //      // @@ send step back too for frontend
            //      // data.reg_completed = theOtherResource.reg_completed;

            //  }


            // return _u.Response({ msg: 'User validated'},  200, true );

        }

        // @@ -- if no response -- retry
        let em_ = 'Error Creating account. Please try again';
        return _u.Response({ msg: `${set_res.data && set_res.data.msg ? set_res.data.msg : em}` }, 400, false);


        // console.log('Auth get -->', get_res );

        // return { success: true, statusCode: 200, data: { msg: "User valid" } }
    }

    catch (err) {
        console.log('err ---===>', err);
        return _u.Response({ msg: 'Server Error _' }, 500, false);
    }


};


module.exports = account_controller;
