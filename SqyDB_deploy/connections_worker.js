// connections_worker

// import { readdir } from 'node:fs/promises';
import fs from 'node:fs';
// import { join } from 'node:path';

const thisWorker = {};


thisWorker.count = 0;

thisWorker.indexObj = {};



// @@ scan the ids in each directory to index
thisWorker.scan_to_index = async function (conn_dir, conn) {

    // @@ -- This 
    // console.log(' scanning_to_index ', conn_dir );

    // let id_folders = await getFiles(conn_dir);

    // id_folders = id_folders.filter(dir => dir.indexOf('DS_Store') == -1);
    let id_folders = fs.readdirSync(conn_dir);

    let index_key = thisWorker.config.connections_index_key_maps[conn];
    thisWorker.indexObj[index_key] = thisWorker.indexObj[index_key] || {};

    id_folders.forEach(each_id_folder => {

        // console.log('each_id_folder -->', each_id_folder );
        if (fs.lstatSync(`${conn_dir}/${each_id_folder}`).isDirectory()) {



            thisWorker.indexObj[index_key][each_id_folder] = thisWorker.indexObj[index_key][each_id_folder] || {};

            // @@ read the .sqydf files in node
            fs.readdirSync(`${conn_dir}/${each_id_folder}`).forEach(async (sqydf_file_name, i) => {


                if (/[(.sqydf)]$/.test(sqydf_file_name)) {

                    let sqydf_file = fs.readFileSync(`${conn_dir}/${each_id_folder}/${sqydf_file_name}`, 'utf8');

                    let _id = sqydf_file_name.slice(0, -6);

                    // console.log('_id -------->', _id, '\n conn_dir :: ->', conn);

                    // @@ slice o excluse .json in namin.. set as key on cache 

                    // -- if there's need to index --- //
                    if (thisWorker.config.connections_index_key_maps[conn]) {

                        //     // sqydf_file_values

                        let sqydf_file_values = sqydf_file.split(',');

                        // @@ --- forEach values in the file
                        sqydf_file_values.forEach(key_val_pairs => {

                            key_val_pairs = key_val_pairs.split(':');

                            let kk = key_val_pairs[0].replace(/\"/g, '');

                            // thisWorker.indexObj[index_key][kk] = thisWorker.indexObj[index_key][kk] || {}

                            // thisWorker.indexObj[index_key][kk][each_id_folder] = _id;

                            // thisWorker.indexObj[index_key][kk] = thisWorker.indexObj[index_key][kk] || {}
                            if (kk.length > 5 ) {
                                thisWorker.indexObj[index_key][each_id_folder][kk] = _id;
                            }
                            

                        })

                    }
                    // const html_to_extract = JSON.parse(fs.readFileSync(`${files_folder}${filo}`,'utf8'); 
                    sqydf_file = null; _id = null;

                }




            })

        }


    });



};

thisWorker.create_conn_folders = function (connections_list) {


    connections_list.forEach(connection => {

        if (!fs.existsSync(`${thisWorker.config.db_data_dir}/connections/${connection}`)) {

            // console.log(`${workData.collection} doesn't exist -- gotta create`);

            // Create collection folder here
            fs.mkdir(`${thisWorker.config.db_data_dir}/connections/${connection}`, (err) => {

                if (err) { console.error(err); return }

                console.log(`coll dir:: ${connection} created successfully!`);

            });

        }

        // @@ -- scan it do index --- == 
        else {

            thisWorker.scan_to_index(`${thisWorker.config.db_data_dir}/connections/${connection}`, connection)
        }


    })


    // console.log(' thisWorker.indexObj -------->', thisWorker.indexObj);

}


thisWorker.create_or_scan = async function () {


    try {

        // fs.existsSync(`${thisWorker.config.db_data_dir}/connections`);

        // console.log('con_dir_exists --> ', con_dir_exists);

        if (!fs.existsSync(`${thisWorker.config.db_data_dir}/connections`)) {

            fs.mkdir(`${thisWorker.config.db_data_dir}/connections`, (err) => {

                thisWorker.create_conn_folders(thisWorker.config.connections);

            });
        }

        else {

            thisWorker.create_conn_folders(thisWorker.config.connections);

        }


    } catch (error) {

        console.log('error 00 --> ', error);

    }
}

thisWorker.unpersist_connection_value = async function (options) {


    console.log(' Delete options id --->', options  )

    try {


        return new Promise( async (resolve, reject) => {

        // @@ -- read holding file and remove this item
        let existingDataPath = thisWorker.config.db_data_dir + '/' + 'connections/' + options.collection + '/' + options.id;

        // const the_data_file = Bun.file(`${existingDataPath}/${options.file_name}.sqydf`);

        // let new_file = '', file_exists = await the_data_file.exists();
        let the_data_file = fs.readFileSync(`${existingDataPath}/${options.file_name}.sqydf`, 'utf8');

        // console.log(' Delete id --->', new_file, file_exists, 'ttt --->', await the_data_file.text());

        console.log('the_data_file -->', the_data_file );


        if (the_data_file) {

            // new_file = await the_data_file.text();
            let new_file = the_data_file;
            new_file = "{" + new_file + "}";

            new_file = new_file.replace('{,', '{');

            new_file = JSON.parse(new_file);

            console.log(' Delete id 0000  --->', new_file );

            delete new_file[options.toRemoveId];

            new_file = JSON.stringify(new_file);

            new_file = new_file.replace('{', '').replace('}', '');

            // await Bun.write(`${existingDataPath}/${options.file_name}.sqydf`, new_file);
            // fs.writeFileSync(`${existingDataPath}/${options.file_name}.sqydf`, new_file);

            fs.writeFile(`${existingDataPath}/${options.file_name}.sqydf`, new_file, function (err) {
                if (err) throw err;
                console.log('Saved!');
                resolve('OK');
            });

            // return 'OK'
            // resolve('OK');
        }

        else {
            // new_file = options.value;
            // return 'nullf'
            resolve('nullf')
        }

    });

    } catch (error) {

        console.log(' error --->', error);

    }

};

thisWorker.persist_connection_value = async function (options) {

    let existingDataPath = thisWorker.config.db_data_dir + '/' + 'connections/' + options.collection + '/' + options.id;

    let file_exists = fs.existsSync(`${existingDataPath}/${options.file_name}.sqydf`);

    // console.log('existingDataPath 00 --->', existingDataPath, options.file_name, file_exists);

    return new Promise((resolve, reject) => {

        let write_file_to_disk = async function () {

            // const the_data_file = Bun.file(`${existingDataPath}/${options.file_name}.sqydf`);
            // let new_file = '', file_exists = await the_data_file.exists();

            // let the_data_file = fs.readFileSync(`${existingDataPath}/${options.file_name}.sqydf`, 'utf8');

            // let file_exists = fs.existsSync(`${existingDataPath}/${options.file_name}.sqydf`);
            let the_data_file = '';

            if ( file_exists ) {

                    the_data_file = fs.readFileSync(`${existingDataPath}/${options.file_name}.sqydf`, 'utf8');

                    
            }
            // if (file_exists) {

            //     let the_data_file = fs.readFileSync(`${existingDataPath}/${options.file_name}.sqydf`, 'utf8');

            //     // if (the_data_file) {
            //     // let f = await the_data_file.text();
            //     // new_file = f.length > 6 ? f + ',' + options.value : options.value;

            //     // console.log('fff -->', f);
            //     new_file = the_data_file + ',' + options.value;

            //     // new_file = the_data_file.length == 0 ? options.value : f + ',' + options.value;
            // }

            // else {
            //     new_file = options.value;
            // }
            options.value = options.value.replace('{', '').replace('}', '');

            let new_file = the_data_file + ',' + options.value;

            // let file_ext = '.sqydf';

            // let new_file = 'kdjkhfgdjhkjlgfdjhghdgfh~~' + file_exists + '~' + the_data_file;
            // console.log(' \n \n  new_file -------- 00 --->', new_file );
            // options.file_name = options.file_name == '$separate_file' ? : options.file_name;

            // if ( options.as_separate_file ) {
            //     new_file = options.value;
            // }

            await Bun.write(`${existingDataPath}/${options.file_name}.sqydf`, new_file);
            // fs.writeFileSync(`${existingDataPath}/${options.file_name}.sqydf`, new_file);

            // fs.writeFile(`${existingDataPath}/${options.file_name}.sqydf`, new_file, function (err) {

            //     if (err) throw err;

            //     console.log('Saved!');
            //     resolve('OK');

            // });

            // console.log('file exists ---->', file_exists, new_file, '\n path + name  ::', `${existingDataPath}.sqydf`)
            // resolve('OK');

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

    })



    // return "OK"
};

// Worker thread:
self.addEventListener( "message", async (event) => {

    setTimeout(function () {

        console.log('connections_worker Message received ::: ---- >', event.data);

    }, 600);

    // const work_id = event.data.job + '_' + Date.now();
    // const work_id = event.data.job + '_' + Date.now();

    // let job = { ...event.data };
    thisWorker.config = event.data.config;

    if (typeof thisWorker[event.data.fnc] == 'function') {

        thisWorker[event.data.fnc](event.data);

        if (event.data.fnc == 'create_or_scan') {

            // thisWorker.create_or_scan();

            delete thisWorker.indexObj.undefined;

            self.postMessage({
                connection_index: thisWorker.indexObj
            })

            process.exit();
        }

        process.exit();
    }

    else {
        process.exit();
    }

    // let current_fnc = job.fnc;

    // SqyWorker.queue.set(work_id, job);
    // let res = await SqyWorkerFncs[current_fnc](job.data);

    // if (res == 'done') {

    console.log(' Job done . Mail sent ---->');


    // -- delete job then call next
    // SqyWorkerFncs.unset_job(current_job_key);

    // }


});


setInterval(function () {

    //     thisWorker.count++;

    console.log(' connections_worker running --- ::: -- >', process.pid, thisWorker.count);

    //     // self.postMessage({ msg: "job done", count:thisWorker.count });

}, 300);





















const persit_remove = async function (options) {

    // thisWorker.unpersist_connection_value = async function (options) {


    console.log(' Delete options id --->', options)
    try {


        // @@ -- read holding file and remove this item
        let existingDataPath = config.db_data_dir + '/' + 'connections/' + options.collection + '/' + options.id;

        const the_data_file = Bun.file(`${existingDataPath}/${options.file_name}.sqydf`);

        let new_file = '', file_exists = await the_data_file.exists();

        console.log(' Delete id --->', new_file, file_exists, 'ttt --->', await the_data_file.text());


        if (file_exists) {

            new_file = await the_data_file.text();
            new_file = "{" + new_file + "}";
            new_file = JSON.parse(new_file);

            console.log(' Delete id 0000  --->', new_file, file_exists);

            delete new_file[options.toRemoveId];

            new_file = JSON.stringify(new_file);
            new_file = new_file.replace('{', '').replace('}', '');

            await Bun.write(`${existingDataPath}/${options.file_name}.sqydf`, new_file);

            return 'OK'
        }

        else {
            // new_file = options.value;
            return 'nullf'
        }

    } catch (error) {

        console.log(' error --->', error);

    }

    // };

}
