// get_user_chat

// const { dbConfig } = await import('../../../SqyDB_deploy/_config.js');
import fs from 'node:fs';

const CURR_DIR = import.meta.dir;

export let get_user_chat = async function (reqObj, model, helpers) {

    // @@ --- Allowed roles to create
    if (!helpers.auth$) {
        return { data: { msg: 'Authorization required. Kindly login!!' }, statusCode: 401, success: false };
    }

    if (typeof reqObj.auth_expires == 'number'
        && typeof helpers.auth$ == 'object' && helpers.auth$ !== null
        && typeof helpers.auth$.timeSinceIssued == 'number' &&
        auth$.timeSinceIssued > reqObj.auth_expires

    ) {

        return { data: { msg: 'Expired Authorization. Kindly login again!!' }, statusCode: 401, success: false };
    }

    // let liking_user = reqObj.payloadData['liking_user'];

    // let the_user_id = reqObj.payloadData['the_user_id'];
    // let youVIc = payloadData['user_id'];
    // if ( payloadData['user_id'] == );

    // let res_to_get = reqObj.payloadData['sub_resource_type'];
    // return { success: true, statusCode: 200, data: { msg: 'OK', chats: [] } }


    let chatsDir = `${CURR_DIR}/../../../_chats_data/messages`;
    chatsDir = `${chatsDir}/${reqObj.payloadData['parter_to_get_id']}`;

    if (!fs.existsSync(chatsDir)) {

        console.log('No chat dir ---------------- ', reqObj.payloadData['parter_to_get_id'], chatsDir, CURR_DIR );

        return { success: true, statusCode: 200, data: { msg: 'OK', chats: [] } }
    }

    const the_data_file1 = Bun.file(`${chatsDir}/${reqObj.payloadData['user_id']}~~~01.chat`);

    let file_exists = await the_data_file1.exists();


    if (file_exists) {

        let f1 = await the_data_file1.text();

        f1 = '['+f1 +']';
        f1 = JSON.parse(f1);

        return { success: true, statusCode: 200, data: { msg: 'OK', chats: f1 } }

    }

    console.log('No chat file ---------------- ');

    return { success: true, statusCode: 200, data: { msg: 'OK', chats: [] } }
    // console.log('Get home Feeds db_response -===>', get_user_sub_resource_res);

};