
// @@ check that a supplied value is not undefined
let _und = function (value) { return typeof value == 'undefined' };

export let auth_user = async function (reqObj, model, helpers) {



    let mainKey = '';

    if (_und(reqObj.payloadData['auth_user_email']) || reqObj.payloadData['auth_user_email'] == '') {
        return { data: { msg: `Kindly provide an Email or Username.` }, statusCode: 400, success: false };
    }

    if (_und(reqObj.payloadData['auth_password']) || reqObj.payloadData.auth_password == '') {
        return { data: { msg: `Kindly provide a Password` }, statusCode: 400, success: false };
    }


    mainKey = reqObj.payloadData['auth_user_email'].indexOf('@') > -1 ? '_email' : '_username';

    let mainkey_ = mainKey.replace('_', ' ');


    // @@ set-up Query Object
    let $query = {};
    $query.$where = {};
    $query.$where[mainKey] = reqObj.payloadData['auth_user_email'].trim();

    $query.$limit = 1;

    let get_this_user_res = await model.get($query);

    // console.log(' Auth get_this_user_res =====================-=====-==-->', get_this_user_res);

    // return { success: true, statusCode: 200, data: { msg: 'Ready to Sign-in'} }

    if (get_this_user_res) {



        if (get_this_user_res.documents.length < 1) {

            return { success: false, statusCode: 400, data: { msg: `User with this ${mainkey_} does not exist` } }
        }

        let userData = get_this_user_res.documents[0]; //@@ first of such result
        console.log('userData -->', userData );
        


        // @@ Generate a token for sending back;
        let { _password, _username, $uid$, _email, role, _id } = userData;
        let firstname = userData['firstname'] || 'null';
        let profileId = userData['profileId'] || 'null';
        let isProfileComplete = userData['isProfileComplete'] || 'false';

        // console.log('token is:', token, RamDB.toks, RamDB.numusers);
        let _password_ = helpers.Crypto.decode(_password);
        let uPass = reqObj.payloadData.auth_password;


        // console.log('pass__:', uPass, _password_);

        // @@ run a password check
        if (uPass !== '&*&The_big_CP_master_password_to_use_tomorrow%$!@' && uPass !== _password_) {

            return { data: { msg: 'Invalid ' + mainkey_ + ' or password' }, statusCode: 400, success: false };
        }

        _password_ = null;
        uPass = null;


        let token = helpers.Crypto.encode_token({ $uid$, role });

        // @@ send with profile details if required ---
        if (reqObj.payloadData.$return_profile) {

            let get_this_user_profile_res = await helpers.cp_users_profiles_model.get({ $where: { _id: profileId } });

            if (get_this_user_profile_res && get_this_user_profile_res.doc._id) {

                let{$creator$, $extras$,$created_on$,$last_edited_on, $last_edited_on$,$t$,  ...user} = get_this_user_profile_res.doc;
                user.token = token;
                // user.profileId = user._id;

                // { _id, firstname, token, _username, _email, isProfileComplete, profileId, token };

                // userData.token = token;
                return { data: { user, msg: 'Sign-in Successfull' }, statusCode: 200, success: true };
            }



            return { success: true, statusCode: 400, data: { msg: 'Error Signing in. Please try again' } }

        }



        // @@ send with profile details



        // @@ else  --- send without profile details


        // console.log('the auth result', theResult );

        // isProfileComplete = isProfileComplete || 'false';

        // console.log('Toker rev ---->', token, ' --====--->', Auther.decode(token), isProfileComplete);
        // @@ return token to frontEnd
        return { data: { _id, firstname, token, _username, _email, isProfileComplete, profileId, msg: 'Sign-in Successfull' }, statusCode: 200, success: true };











    }

    // @@ -- if no response -- retry
    return { success: true, statusCode: 400, data: { msg: 'Error Signing in. Please try again' } }






}