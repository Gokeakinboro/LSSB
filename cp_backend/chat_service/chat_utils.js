
import fs from 'node:fs';

const config = {

    chats_data_dir: '../../_chats_data',
    init_dirs: ['meta', 'messages']
};

export const chat_utils = {};

chat_utils.update_sub_resource = async function (options) {

    try {

        if (options.ops == "$addTo") {

            SqyDB_index[options.collection]._id[options.$where._id] = SqyDB_index[options.collection]._id[options.$where._id] || {};

            let file_name = ((options.current_iteration || 0) + 1) * 10000;

            SqyDB_index[options.collection]._id[options.$where._id][options.indexKey] = "" + file_name;

            // options_.data = JSON.stringify(options_.data);
            let existingDataPath = config.chats_data_dir + '/' + options.collection + '/' + options.$where._id;


            let write_file_to_disk = async function () {

                const the_data_file = Bun.file(`${existingDataPath}/${file_name}.sqyf`);
                let new_file = '', file_exists = await the_data_file.exists();

                if (file_exists) {
                    let f = await the_data_file.text();
                    new_file = f.length > 6 ? f + ',' + options.value : options.value;
                }

                else {
                    new_file = options.value;
                }

                await Bun.write(`${existingDataPath}/${file_name}.sqyf`, new_file);

                // console.log('file exists ---->', file_exists, new_file, '\n path + name  ::', `${existingDataPath}.sqyf`)

            }

            // @@  first check if the dir for this resource exists in this collection dir
            if (!fs.existsSync(existingDataPath)) {

                // Create collection folder here
                fs.mkdir(existingDataPath, (err) => {
                    write_file_to_disk();
                })
            }

            else {
                write_file_to_disk();
            }

            // SqyDB_Worker_Queue[`${options_.data._id}_set_${Date.now()}`] = options_;

            return 'OK'
        }

        if (options.ops == "$removeFrom") {

            SqyDB_index[options.collection]._id[options.$where._id] = SqyDB_index[options.collection]._id[options.$where._id] || {};

            if (typeof SqyDB_index[options.collection]._id[options.$where._id][options.indexKey] !== 'undefined') {

                let holding_file = SqyDB_index[options.collection]._id[options.$where._id][options.indexKey];
                delete SqyDB_index[options.collection]._id[options.$where._id][options.indexKey];

                // @@ -- read holding file and remove this item
                let existingDataPath = config.chats_data_dir + '/' + options.collection + '/' + options.$where._id;

                const the_data_file = Bun.file(`${existingDataPath}/${holding_file}.sqyf`);

                let new_file = '', file_exists = await the_data_file.exists();

                if (file_exists) {

                    new_file = await the_data_file.text();
                    new_file = "{" + new_file + '}';
                    new_file = JSON.parse(new_file);
                    delete new_file[options.indexKey];
                    new_file = JSON.stringify(new_file);
                    new_file = new_file.replace('{', '').replace('}', '');

                    await Bun.write(`${existingDataPath}/${holding_file}.sqyf`, new_file);

                    return 'OK'
                }

                else {
                    // new_file = options.value;
                    return 'nullf'
                }



                return 'OK'


            }

            return 'null'


        }

    } catch (error) {

        console.log('error ---->', error);
        return "err"

    }

}

chat_utils.persist_chat = async function (options) {

    console.log('Now persisting this nigga :::: -->', options);

    try {


        let file_name1 = options.toUser + '~~~' + (options.chat_count || 0) + 1;
        let file_name2 = options.fromUser + '~~~' + (options.chat_count || 0) + 1;

        let existingDataPath1 = config.chats_data_dir + '/' + 'messages' + '/' + options.fromUser;
        let existingDataPath2 = config.chats_data_dir + '/' + 'messages' + '/' + options.toUser;

        // let chat_users = [options.fromUser, options.toUser];

        let write_file_to_disk = async function () {

            const the_data_file1 = Bun.file(`${existingDataPath1}/${file_name1}.chat`);
            const the_data_file2 = Bun.file(`${existingDataPath2}/${file_name2}.chat`);
            let new_file1 = '', file_exists1 = await the_data_file1.exists();
            let new_file2 = '', file_exists2 = await the_data_file2.exists();

            options.chatMessage = JSON.stringify(options.chatMessage);

            if (file_exists1) {
                let f1 = await the_data_file1.text();
                new_file1 = f1.length > 6 ? f1 + ',' + options.chatMessage : options.chatMessage;
            }

            else {
                new_file1 = options.chatMessage;
            }

            if (file_exists2) {
                let f2 = await the_data_file2.text();
                new_file2 = f2.length > 6 ? f2 + ',' + options.chatMessage : options.chatMessage;
            }

            else {
                new_file2 = options.chatMessage;
            }

            await Bun.write(`${existingDataPath1}/${file_name1}.chat`, new_file1);
            await Bun.write(`${existingDataPath2}/${file_name2}.chat`, new_file2);

            // console.log('file exists ---->', file_exists, new_file, '\n path + name  ::', `${existingDataPath}.sqyf`)

            // @@ update meta
            const the_meta_file1 = Bun.file(`${existingDataPath1}/_meta.json`);
            const the_meta_file2 = Bun.file(`${existingDataPath2}/_meta.json`);

            let new_meta_file1 = {}, meta_file_exists1 = await the_meta_file1.exists();
            let new_meta_file2 = {}, meta_file_exists2 = await the_meta_file2.exists();

            console.log('meta file for sending user exists ::: -->', meta_file_exists1 );

            if (meta_file_exists1) {

                let f1 = await the_meta_file1.text();
                f1 = JSON.parse(f1);

                // console.log('meta f1 for sender ::: -->', f1, '\ f1Text:: ->', f1Text );

                f1[options.toUser] = {
                    _id: options.toUser, 
                    fullname: options.toUser_fullname,
                    displayPhoto: options.toUser_displayPhoto, 
                    chat_count: (options.chat_count ? options.chat_count + 1 : 1),
                    lastMessage: f1[options.toUser].lastMessage || `Click to chat with ${options.toUser_fullname}`
                };

            }

            else {

                new_meta_file1[options.toUser] = {
                    _id: options.toUser, 
                    fullname: options.toUser_fullname,
                    displayPhoto: options.toUser_displayPhoto, 
                    chat_count: (options.chat_count ? options.chat_count + 1 : 1),
                    lastMessage: `Click to chat with ${options.toUser_fullname}`
                };

                // new_file1 = options.chatMessage;
            }

            if (meta_file_exists2) {

                 let f2 = await the_meta_file1.text();
                f2 = JSON.parse(f1);

                f2[options.fromUser] = {
                    _id: options.fromUser, 
                    fullname: options.fromUser_fullname,
                    displayPhoto: options.fromUser_displayPhoto, 
                    chat_count: (options.chat_count ? options.chat_count + 1 : 1),
                    lastMessage: f2[options.fromUser].lastMessage || `Click to chat with ${options.fromUser_fullname}`
                };

            }

            else {

                new_meta_file2[options.fromUser] = {
                    _id: options.fromUser, 
                    fullname: options.fromUser_fullname,
                    displayPhoto: options.fromUser_displayPhoto, 
                    chat_count: (options.chat_count || 1),
                    lastMessage: `Click to chat with ${options.fromUser_fullname}`
                };

                // new_file1 = options.chatMessage;
            }

            console.log('Now writig Users one meta ::: -->', new_meta_file1 );

            await Bun.write(`${existingDataPath1}/_meta.json`, JSON.stringify(new_meta_file1));
            await Bun.write(`${existingDataPath2}/_meta.json`, JSON.stringify(new_meta_file2));

            // console.log('file exists ---->', file_exists, new_file, '\n path + name  ::', `${existingDataPath}.sqyf`)

            // @@ update meta
            // const the_meta_file1 = Bun.file(`${existingDataPath1}_meta.json`);
            // const the_meta_file2 = Bun.file(`${existingDataPath2}_meta.json`);


        }

        // @@  first check if the dir for this resource exists in this collection dir
        if (!fs.existsSync(existingDataPath1)) {

            // Create collection folder here
            fs.mkdir(existingDataPath1, (err) => {

                if (!fs.existsSync(existingDataPath2)) {

                    fs.mkdir(existingDataPath2, (err) => {
                        write_file_to_disk();
                    })
                }

                else {
                    write_file_to_disk();
                }

            })
        }

        else {
            write_file_to_disk();
        }


    } catch (error) {

    }
}

chat_utils.init = function () {

    console.log('Initializing Chat utils... \n checking necessary dirs \n ----> create them if not exist');

    config.init_dirs.forEach((dir) => {

        // @@  first check if the dir for this resource exists in this collection dir
        if (!fs.existsSync(`${config.chats_data_dir}/${dir}`)) {

            // Create collection folder here
            fs.mkdir(`${config.chats_data_dir}/${dir}`, (err) => {
                // write_file_to_disk();
            })
        }

    })
}

chat_utils.init();
