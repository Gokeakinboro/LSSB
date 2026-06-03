
// const { SqyDB_Model } = await import('../_lib_/SqyDB.Model.js');
const { SqyDB_Model } = await import('../_lib_/SqyDB.Model.js');

// let { user_create_account } = await import('../cloud_functions/user_create_account.js');

// const { get_user } = await import('../cloud_functions/get_user.js');

const { Crypto } = await import('../_lib_/Crypto.js');

const { utils } = await import('../_lib_/utils.js');

// const { create_applicant } = await import('../lssb_functions/create_applicant.js');

const { create_pin } = await import('../lssb_functions/create_pin.js');
// const { update_grant } = await import('../lssb_functions/update_grant.js');
const { fetch_pins } = await import('../lssb_functions/fetch_pins.js');

const { use_pin } = await import('../lssb_functions/use_pin.js');

const { delete_pin } = await import('../lssb_functions/delete_pin.js');

const controller_fncs = {

    // create_account: user_create_account,
    // get_applicant, 
    // submit_application,
    use_pin,
    create_pin,
    fetch_pins,
    delete_pin
};

// user_create_account = null;

// @@ user model declaration
let aNode = 'c1a' + Bun.argv[Bun.argv.indexOf('--node') + 1];

const controller_options = {
    collection: 'LSSB_PINs',

    schema: {}

};


const LSSB_pin_model = new SqyDB_Model({  // db: config._db,  
    collection: controller_options.collection,
    schema: controller_options.schema
});


// const LSSB_applicants_model = new SqyDB_Model({  // db: config._db,  
//     collection: 'LSSB_applicants',
//     schema: {}
// });

// @@ Uset Controller
export let theController = async function (reqObj) {

    try {

        // console.log('LSSB Applicant.js 179 hit --==>', reqObj.payloadData );

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

                // console.log('auth k ----->', k, k.indexOf('undefined') > -1, auth$[k].indexOf('undefined') > -1);

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

            let cloud_response = await controller_fncs[cloud_action](reqObj, LSSB_pin_model, { utils, Crypto, aNode, auth$ });

            // console.log('cloud_response --=>', cloud_response );
            return cloud_response

        }

        return { success: false, statusCode: 400, error: { msg: 'Invalid Cloud Action' } }

    } catch (error) {

        console.log(' -================================------->>>>>>>>>>>>>> Error performing OPs -====>', error);
        // await Bun.write('../error.txt', JSON.stringify(error) );
        return { success: false, statusCode: 500, error: { msg: `Error performing OPs` } }
    }

}


