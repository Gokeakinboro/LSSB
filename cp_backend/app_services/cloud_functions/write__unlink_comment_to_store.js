
/// @@ --

import fs from 'node:fs';

const config = {

    _data_dir: '../../_d_data/$cp_comments',
    init_dirs: ['meta', 'messages']
};

let write_file_to_disk = async function ({ existingDataPath, file_name, options }) {

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

export let write__unlink_comment_to_store = async function (commentObj) {


    if (commentObj.ops == "$add_comment") {

        let _id = '';

        _id = commentObj.resourceId + '~~' + _date_;

        // @@ check if the resource dir exists.. then write fil

        return { msg: 'OK', _id }
    }

    
}


let run_func = async function () {


    let startTime = Date.now();
    let comments = [];

    for ( let index = 1; index <= 20; index++ ) {

        // const element = array[index];
        const the_data_file = Bun.file(`${config._data_dir}/${index}.json`);
        let new_file = '', file_exists = await the_data_file.exists();

        console.log('file_exists :: ->', `${config._data_dir}/${index}.json`, file_exists );

        if (file_exists) {
            let f = await the_data_file.json();
            // new_file = f.length > 6 ? f + ',' + options.value : options.value;
            comments.push(f._id);
        }


        if ( index == 20) {

            console.log('All done :: ---> ', index, comments, (Date.now() - startTime ) / 1000, ' secs' );
        }

    }


}


run_func();


