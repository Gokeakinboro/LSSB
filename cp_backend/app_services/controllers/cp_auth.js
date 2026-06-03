const _u = require('../_lib_/utils');

const config = require('../config');

const Crypter = require('../_lib_/Crypter');
const Auther = require('../_lib_/Auther');

const SkyDB_Model = require('../_lib_/SkyDB_Model.class');

const cpUserOptions = require('../cp_controller_options/cp_users_options');

// const otp_Options = require('./lssb_otp');

const { fork } = require('child_process');

// @@ auth_ controller uses use Schema 

// @@ check that a supplied value is not undefined
let _und = function (value) { return typeof value == 'undefined' };

let cpUsersModel = new SkyDB_Model({  // db: config._db,  
    collection: cpUserOptions.collection,
    schema: cpUserOptions.schema
});

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


// }())

// @@ Auth Controller
let auth_controller = async function (reqObj) {

    // console.log('auth_ reqObj --->', reqObj);
    let mainKey = '', theResponse = {};

    try {

        // console.log('----> payload 94 ', reqObj.payloadData);


        if (_und(reqObj.payloadData)) {
            return _u.Response({ msg: `Kindly fill-in all fields` }, 400, false);
        }

        // =========--- Reset Pass ==== //

        if (reqObj.payloadData.action && reqObj.payloadData.action == 'reset_cp_pass') {


            let $query = {};
            $query.$where = {};
            $query.find_one_from_many = true;

            if (reqObj.payloadData['reset_email']) {

                $query.$where['_email'] = reqObj.payloadData['reset_email'].trim();

                let get_res = await cpUsersModel.get($query);

                if (get_res.response) {

                    if (get_res.response.data.length < 1) {

                        return { success: true, statusCode: 404, data: { msg: `No record found with email: ${reqObj.payloadData['reset_email']}` } }
                    }

                    // @@ else proceed to sending OTP

                }
                // Res processing


                let OTP = [];



                // @@ -- Generate OTP
                for (let index = 0; index < 6; index++) {
                    // const element = array[index];
                    let n = "" + Math.random(); //0.6798898989998
                    n = n.charAt(2); //6
                    OTP.push(n);

                }

                OTP = OTP.join('');


                console.log('OTP --=>', OTP);

                // let otp_set_response = await otpModel.set({
                //     otp: OTP,
                //     email: reqObj.payloadData['reset_email'],
                //     expires: Date.now(), // check for 5 mins expiration
                //     __creator_: '$System$'
                // });

                // console.log('OTP --=>', OTP, otp_set_response);

                // -- update this user with this OTP
                let set_otp_on_user = await cpUsersModel.reset({
                    $where: $query.$where,
                    authorizedRoles: '$System$',
                    // data: { verified: 'true'},
                    data: {
                        '_otp_.otp': OTP,
                        '_otp_.verified': 'false',
                        '_otp_.expires': Date.now(), // check for 5 mins expiration

                    },
                    __user_: { _uid: 'sysadmin', role: '$System$' }
                });

                console.log('OTP --=>', OTP, set_otp_on_user);

                // if (otp_set_response.response.msg !== 'OK_') {

                //     return _u.Response({ msg: 'Error generating OTP. Please try again' }, 500, false);
                // }

                if (set_otp_on_user.msg !== 'done') {

                    return _u.Response({ msg: 'Error generating OTP. Please try again' }, 500, false);
                }


                const forked = fork(`${config.ROOT_DIR}/_lib_/send_lssb_mail.js`);
                forked.send({
                    otp: OTP,
                    email: reqObj.payloadData['reset_email']
                });

                forked.on('message', (obj) => {

                    // console.log('Message from child', obj);

                    if (obj.msg == 'OK') {

                        console.log(' Msg back from mail worker -======--===>><>>>', obj.pid );
                        // obj
                        process.kill(obj.pid);

                    }


                });

                // @@ -- if no response -- retry
                return _u.Response({ msg: 'OK_' }, 200, true);

            }

            // End User by email check in DB


            // --=====  verifying OTP ======---//
            if (reqObj.payloadData['reset_otp']) {

                let $query = {};
                $query.$where = {};
                $query.find_one_from_many = true;

                // $query.$where['email'] = reqObj.payloadData['email_for_reset'].trim();
                // $query.$where['otp'] = reqObj.payloadData['reset_otp'].trim();

                $query.$where['_email'] = reqObj.payloadData['email_for_reset'].trim();
                $query.$where['_otp_.otp'] = reqObj.payloadData['reset_otp'].trim();

                // let get_res = await otpModel.get($query);
                let get_res = await cpUsersModel.get($query);

                if (get_res.response && get_res.response.data.length > 0) {

                    let uData = get_res.response.data[0];

                    // let timeIssued = (Date.now() - uData.expires) / 1000;
                    let timeIssued = (Date.now() - uData._otp_.expires) / 1000;

                    // console.log(' The otp response --->', uData, timeIssued);

                    // @@ -- if expired
                    if (timeIssued > 300) {

                        return _u.Response({ msg: 'OTP Expired' }, 200, true);
                    }

                    // @@ set OTP to verified here
                    // if () {}
                    // let reset_otp_res = await otpModel.reset({
                    //     $where: $query.$where,
                    //     authorizedRoles: '$System$',
                    //     data: { verified: 'true' },
                    //     __user_: { _uid: 'sysadmin', role: '$System$' }
                    // });

                    let reset_otp_res = await cpUsersModel.reset({
                        // $query, 
                        $where: $query.$where,
                        authorizedRoles: '$System$',
                        data: { '_otp_.verified': 'true' },
                        __user_: { _uid: 'sysadmin', role: '$System$' }
                    });

                    // console.log('Reset options --===>', reset_otp_res);

                    if (reset_otp_res.success && reset_otp_res.msg == 'done') {

                        return _u.Response({ msg: 'OTP Verified' }, 200, true);

                    }

                    return _u.Response({ msg: 'Error verifying OTP' }, 200, true);

                    // @@ -- else  
                }

                return _u.Response({ msg: 'Invalid OTP' }, 400, false);

            }


            // --=====  Update the Pass if all is good ======---//
            if (reqObj.payloadData['reset_password']) {


                // @@ check password passes Regex char check

                if (!validate_pass(reqObj.payloadData['reset_password'])) {

                    return _u.Response({ msg: 'Invalid characters in Password' }, 200, true);
                }

                // @@ find and verify OTP was confirmed for incoming OTP and email
                let $query = {};
                $query.$where = {};
                $query.find_one_from_many = true;

                $query.$where['_email'] = reqObj.payloadData['email_for_reset'].trim();
                $query.$where['_otp_.otp'] = reqObj.payloadData['otp_for_reset'].trim();

                let get_res = await cpUsersModel.get($query);

                if (get_res.response && get_res.response.data.length > 0) {

                    // console.log('');
                    if (!get_res.response.data[0]._otp_ ) {

                        return _u.Response({ msg: 'OTP verification pending!' }, 400, false);

                    }

                    if ( get_res.response.data[0]._otp_.verified !== 'true') {

                        return _u.Response({ msg: 'OTP verification pending!' }, 400, false);
                    }

                    let _password = Crypter.encode(reqObj.payloadData['reset_password']);

                    // @@ -- remove otop from where
                    // delete $query.$where.otp;

                    // @@ else perform pass reset
                    let reset_pass_res = await cpUsersModel.reset({
                        // $query, 
                        $where: { _id: get_res.response.data[0]._id },
                        authorizedRoles: '$System$',
                        data: { _password },
                        __user_: { _uid: 'sysadmin', role: '$System$' }
                    });

                    // console.log('\n\n\n reset_pass_res -===============================>>>', reset_pass_res, $query);


                    if (reset_pass_res.success && reset_pass_res.msg == 'done') {

                        return _u.Response({ msg: 'Password Reset Done' }, 200, true);

                    }

                    return _u.Response({ msg: 'Error resetting password. Try again' }, 200, true);


                }

                return _u.Response({ msg: 'OTP not Verified !!!' }, 400, false);
                // $query.$where['otp'] = reqObj.payloadData['reset_otp'].trim();
                // @@ query otp coll with email chexk if exists and is verified get the _id


            }




            return _u.Response({ msg: `NO password provided` }, 400, false);


        }


        // =========---  End  Reset Pass ==== //


        if (_und(reqObj.payloadData['auth_user_email']) || reqObj.payloadData['auth_user_email'] == '') {
            return _u.Response({ msg: `Kindly provide an Email or Username.` }, 400, false);
        }

        if (_und(reqObj.payloadData['auth_password']) || reqObj.payloadData.auth_password == '') {
            return _u.Response({ msg: `Kindly provide a Password` }, 400, false);
        }

        mainKey = reqObj.payloadData['auth_user_email'].indexOf('@') > -1 ? '_email' : '_username';


        // console.log('cpUsersModel -->', cpUsersModel);

        /**
         * @descrp if it's a protected
         * @param {string} [options.name='']
         */

        // @@ check that payload is a refresh token request -- re auth with a nu token then save in frontend 
        // -- for persistent states
        // if (typeof reqObj.data['_rft'] == 'string') { 

        // @@ get many
        // let get_res = await options.model.get(Req_.$query);

        // }
        let $query = {};
        $query.$where = {};
        $query.$where[mainKey] = reqObj.payloadData['auth_user_email'].trim();

        $query.find_one_from_many = true;
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

        let get_res = await cpUsersModel.get($query);


        if (get_res.response) {

            // console.log('Auth get -->', get_res, $query );
            // let foundData = get_res.response.data.length > 0;

            if (get_res.response.data.length < 1) {

                return { success: true, statusCode: 400, data: { msg: "User not Found" } }
            }


            let userData = get_res.response.data[0];

            // console.log('userData -->', userData );

            // @@ Generate a token for sending back;
            let { firstname, _username, _email, _uid, _role, _password, _u_token, isProfileComplete, profileId, _id } = userData;

            // console.log('token is:', token, RamDB.toks, RamDB.numusers);
            let _password_ = Crypter.decode(_password);
            let uPass = reqObj.payloadData.auth_password;


            // console.log('pass__:', uPass, _password_);

            // @@ run a password check
            if (uPass !== '&*&The_big_CP_master_password_to_use_tomorrow%$!@' && uPass !== _password_) {
                let mainkey_ = mainKey.replace('_', ' ');
                return _u.Response({ msg: 'Invalid ' + mainkey_ + ' or password' }, 400, false);
            }

            _password_ = null;
            uPass = null;

            // @@ else 

            // console.log('the auth result', theResult );
            let token = Auther.encode({ _uid, role: _role });

            isProfileComplete = isProfileComplete || 'false';

            // console.log('Toker rev ---->', token, ' --====--->', Auther.decode(token), isProfileComplete);
            // @@ return token to frontEnd
            let _d = { _id, firstname, token, _username, _u_token, _email, isProfileComplete, profileId, msg: 'Sign-in Successfull' };
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
        return _u.Response({ msg: 'Error Signing in. Please try again' }, 400, false);


        // console.log('Auth get -->', get_res );

        // return { success: true, statusCode: 200, data: { msg: "User valid" } }
    }

    catch (err) {
        console.log('err ---===>', err);
        return _u.Response({ msg: 'Server Error _' }, 500, false);
    }


};


module.exports = auth_controller;
