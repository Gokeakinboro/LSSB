const _u = require('../_lib_/utils');

const config = require('../config');

const Crypter = require('../_lib_/Crypter');
const Auther = require('../_lib_/Auther');

const Crypto = require('../_lib_/Crypto');

const SkyDB_Model = require('../_lib_/SkyDB_Model.class');

const cpUserOptions = require('../cp_controller_options/cp_users_options');

const cpUserProfileOptions = require('../cp_controller_options/cp_profiles');

const middleware = require('../_lib_/middleware');

// const otp_Options = require('./lssb_otp');

const { fork } = require('child_process');

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


// @@ Create Acc Controller
let account_controller = async function (reqObj) {

    // console.log('auth_ reqObj --->', reqObj);
    // let mainKey = '', theResponse = {};

    try {


        // console.log('----> payload 94 ', reqObj );

        // @@ -- If Action === create account
        if (reqObj.payloadData.account_action == 'set_profile') {

            // hjjjhb b --- 90 ---- p 
            // -- 
            // if (_und(reqObj.payloadData)) {
            //     return _u.Response({ msg: `Kindly fill-in all fields` }, 400, false);
            // }
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


            // if (_und(reqObj.payloadData['_email']) || reqObj.payloadData['_email'] == '') {
            //     return _u.Response({ msg: `Kindly enter an Email.` }, 400, false);
            // }

            // if (_und(reqObj.payloadData['_password']) || reqObj.payloadData['_password'] == '') {
            //     return _u.Response({ msg: `Kindly provide Password.` }, 400, false);
            // }

            // if (_und(reqObj.payloadData['_confirm_password']) || reqObj.payloadData['_confirm_password'] == '') {
            //     return _u.Response({ msg: `Kindly confirm your Password.` }, 400, false);
            // }

            // if ( reqObj.payloadData['_confirm_password'] == ''  !== reqObj.payloadData['_password'] == '' ) {
            //     return _u.Response({ msg: `Passwords do not match` }, 400, false);
            // }

            // { _uid: '$$cpSystem$$', role: '$$cpSystem$$' }

            let set_profile_res = await set_controller(
                reqObj,
                cpUserProfileOptions, { _uid: decoded_auth._uid, role: '$$cpSystem$$' },
                cpUserProfileOptions.allowed_ops[1].protected
            );

            // console.log( ' \n\n ----- \n set_profile_res -============== -->', set_profile_res );

            if (set_profile_res.success && set_profile_res.data) {

                // console.log('Auth get -->', get_res, $query );
                // let foundData = get_res.response.data.length > 0;

                // @@ Generate a token for sending back;
                // let { firstname, _username, _email, _uid, _role, _password, _u_token, isProfileComplete, _id } = userData;
                let $query = {};
                $query.$where = {};
                $query.find_one_from_many = true;

                $query.$where['_id'] = reqObj.payloadData['u_id'].trim();

                let set_profileComplete_on_user = await cpUsersModel.reset({

                    $where: $query.$where,
                    authorizedRoles: '$$cpSystem$$',
                    // data: { verified: 'true'},
                    data: {
                        'isProfileComplete': 'true',
                        'firstname': reqObj.payloadData['firstname'].trim(),
                        'profileId': set_profile_res.data._id
                    },
                    __user_: { _uid: 'sysadmin', role: '$$cpSystem$$' }

                });

                // @@ else 
                if (set_profileComplete_on_user.msg !== 'done') {

                    return _u.Response({ msg: 'Error setting-up profile' }, 500, false);
                }

                // console.log('Toker rev ---->', token, ' --====--->', Auther.decode(token), isProfileComplete);

                // let _d = { token, _username, _r: _role, _u_token, made_pay_, msg: 'Sign-in Successfull' };
                return _u.Response({ msg: 'Profile set-up Successfull', _id: set_profile_res.data._id }, 200, true);

            }

            else {
                return _u.Response({ msg: 'Error setting-up profile' }, 500, false);
            }

            return

        }



        // @@ -- create user and return token

        if (_und(reqObj.payloadData)) {
            return _u.Response({ msg: `Kindly fill-in all fields` }, 400, false);
        }


        if (_und(reqObj.payloadData['_email']) || reqObj.payloadData['_email'] == '') {
            return _u.Response({ msg: `Kindly enter an Email.` }, 400, false);
        }

        if (_und(reqObj.payloadData['_password']) || reqObj.payloadData['_password'] == '') {
            return _u.Response({ msg: `Kindly provide Password.` }, 400, false);
        }

        if (_und(reqObj.payloadData['_confirm_password']) || reqObj.payloadData['_confirm_password'] == '') {
            return _u.Response({ msg: `Kindly confirm your Password.` }, 400, false);
        }

        if (reqObj.payloadData['_confirm_password'] == '' !== reqObj.payloadData['_password'] == '') {
            return _u.Response({ msg: `Passwords do not match` }, 400, false);
        }

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
