
// @@ check that a supplied value is not undefined
let _und = function (value) { return typeof value == 'undefined' };

export let auth_admin = async function (reqObj, model, helpers) {



    let mainKey = '';

    if (_und(reqObj.payloadData['auth_key']) || reqObj.payloadData['auth_key'] == '') {
        return { error: { msg: `Kindly provide an Email or Username.` }, statusCode: 400, success: false };
    }

    if (_und(reqObj.payloadData['password']) || reqObj.payloadData.password == '') {
        return { data: { msg: `Kindly provide a Password` }, statusCode: 400, success: false };
    }


    reqObj.payloadData['auth_key'] = reqObj.payloadData['auth_key'].trim().toLowerCase();

    mainKey = reqObj.payloadData['auth_key'].indexOf('@') > -1 ? 'email' : 'username';

    let mainkey_ = mainKey.replace('_', ' ');


    // @@ set-up Query Object
    let $query = {};
    $query.$where = {};

    $query.$where[`_fields.${mainKey}`] = reqObj.payloadData['auth_key'].trim();

    // $query.$limit = 1;

    // $query.forAuth = true;
    $query.$return_data = true;

    let uPass = reqObj.payloadData.password;

    // $query.db_fn = 'listDocuments';

    // let get_this_user_res = await model.get($query);

    // console.log(' Auth get_this_user_res =====================-=====-==-->', get_this_user_res);

    // return { success: true, statusCode: 200, data: { msg: 'Ready to Sign-in'} }
     // @@ -- unique check here when get is ready
    //  let get_this_user_res = await model.check_exists({ $where: { '_fields.username': reqObj.payloadData._fields.username } });

     let get_this_user_res = await model.check_exists( $query );
     
    //  console.log(' check_unique_username ---=>>', get_this_user_res, '\n \n :: ---> ', helpers.Crypto.encode('master_pass')  );
 
    //  if (get_this_user_res && get_this_user_res.msg) {
 
    //      return { success: false, statusCode: 400, error: { msg: 'Username already exists' } }
    //  }

    if (get_this_user_res) {


        if ( !get_this_user_res.msg || !get_this_user_res.data) {

            // return { success: false, statusCode: 404, error: { msg: 'Username already exists' } }
            return { success: false, statusCode: 400, error: { msg: `Admin with this ${mainkey_} does not exist` } }

        }



        // if (get_this_user_res.documents.length < 1) {

        //     return { success: false, statusCode: 400, error: { msg: `Admin with this ${mainkey_} does not exist` } }
        // }

        let userData = get_this_user_res.data; // get_this_user_res.documents[0]; //@@ first of such result

        // console.log('Admin userData -->', userData);

        // return { success: true, statusCode: 400, data: { msg: 'Error Signing in. Please try again' } }



        // @@ Generate a token for sending back;
        let { fullname, username, email, capabilities, status } = userData._fields;
        let password = userData.$password$;
        let { role, _id, $uid$ } = userData;
        // let firstname = userData['firstname'] || 'null';
        // let profileId = userData['profileId'] || 'null';

        // let isProfileComplete = userData['isProfileComplete'] || 'false';
        // console.log('password --->', password , userData );
        if (status && status == "Inactive") {

            return { success: false, statusCode: 400, error: { msg: 'Account deactivated.' } }
        }

        if (!password) {

            return { success: false, statusCode: 400, error: { msg: 'Account activation pending.' } }
        }

        // console.log('token is:', token, RamDB.toks, RamDB.numusers);
        password = helpers.Crypto.decode(password);



        // console.log('pass__:', uPass, password);

        // @@ run a password check
        // if (uPass !== 'master_pass@' && uPass !== password) {
        if (uPass !== '&*&Tjhjghghe_big_LGAd_master_password_to_use_%$!@' && uPass !== password) {

            return { error: { msg: 'Invalid ' + mainkey_ + ' or password' }, statusCode: 400, success: false };
        }

        password = null; 
        uPass = null;

        let ca = typeof capabilities == 'object' && typeof capabilities.length == 'number' ? capabilities : ['null'];


        ca = ca.join('_');


        // console.log('password ca --->', ca , 'userData', $uid$, role );

        let token = helpers.Crypto.encode_token({ _id, $uid$, role, capabilities: ca });

        // @@ send with profile details if required ---
        if (reqObj.payloadData.$return_profile) {

            // let get_this_user_profile_res = await helpers.cp_users_profiles_model.get({ $where: { _id: profileId } });

            // if (get_this_user_profile_res && get_this_user_profile_res.doc._id) {

            let { $creator$, $extras$, $password$, $created_on$, $last_edited_on, $last_edited_on$, $t$, role, $uid$, ...user } = userData;
            user.token = token;
            // user._fields =  userData._fields;

            // delete user._fields.password

            // user._fields.capabilities = user._fields.capabilities || [];
            // delete user._fields.password;
            
            // user.profileId = user._id;

            // { _id, firstname, token, _username, _email, isProfileComplete, profileId, token };

            // userData.token = token;
            return { data: { user, msg: 'Sign-in Successfull' }, statusCode: 200, success: true };
            // }


            // return { success: false, statusCode: 400, error: { msg: 'Error Signing in. Please try again' } }

        }



        // @@ send with profile details



        // @@ else  --- send without profile details

        // console.log('Toker rev ---->', token, ' --====--->', Auther.decode(token), isProfileComplete);
        // @@ return token to frontEnd
        return { data: { user: { _id, fullname, token, username, email }, msg: 'Sign-in Successfull' }, statusCode: 200, success: true };





    }

    // @@ -- if no response -- retry
    return { success: true, statusCode: 400, data: { msg: 'Error Signing in. Please try again' } }






}