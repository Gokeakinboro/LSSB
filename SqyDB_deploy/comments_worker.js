// connections_worker

// import { readdir } from 'node:fs/promises';
import fs from 'node:fs';
// import { join } from 'node:path';

const thisWorker = {};


thisWorker.count = 0;

thisWorker.indexObj = {};

thisWorker.cacheObj = {};

thisWorker.admin_report = {};


// @@ comments should sit in cache with a time based sort cache for now..
// @@ comment are partitioned by parent resource ID
// @@ -- leter implementation of comments has latest 10 in parent resource then caching
// @@ -- on demand


// @@ for now, before Goroutine, all comments reside in the folder id folder.. 
// @@ items size in nodes have been raised to 50k...
// -- do all goroutine shit before 50k..

// -- Go routine next... caching, pointers etc.. high speed queries via goroutines etc

// -- structs if they behave like maps.. sorting arrays... 

// --- caches should bne multiple objects..

// -- backgroud workres etc..



// @@ -- no comments chronological order for now



// Worker thread:
self.addEventListener("message", async (event) => {

    setTimeout(function () {

        console.log('connections_worker Message received ::: ---- >', event.data);

    }, 600);

    // const work_id = event.data.job + '_' + Date.now();
    // const work_id = event.data.job + '_' + Date.now();

    // let job = { ...event.data };
    thisWorker.config = event.data.config;

    if (typeof thisWorker[event.data.fnc] == 'function') {

        await thisWorker[event.data.fnc](event.data);

        if (event.data.fnc == 'create_or_scan') {

            // thisWorker.create_or_scan();

            delete thisWorker.indexObj.undefined;

            self.postMessage({
                commentsCache: thisWorker.cacheObj
            })

            process.exit();
        }

        if (event.data.fnc == 'fetch_admin_report') {

            // thisWorker.create_or_scan();

            // delete thisWorker.indexObj.undefined;

            self.postMessage({
                admin_report: thisWorker.admin_report
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




thisWorker.create_or_scan = async function () {


    try {

        // fs.existsSync(`${thisWorker.config.db_data_dir}/connections`);

        // console.log('con_dir_exists --> ', con_dir_exists);

        if (!fs.existsSync(`${thisWorker.config.db_data_dir}/cpx_comments`)) {

            fs.mkdir(`${thisWorker.config.db_data_dir}/cpx_comments`, (err) => {

                thisWorker.scan_folders_to_cache(`${thisWorker.config.db_data_dir}/cpx_comments`);

            });
        }

        else {

            thisWorker.scan_folders_to_cache(`${thisWorker.config.db_data_dir}/cpx_comments`);

        }



    } catch (error) {

        console.log('error 00 --> ', error);

    }
}




// @@ scan the ids in each directory to index
thisWorker.scan_folders_to_cache = async function (comm_dir, conn) {

    // @@ -- This 
    // console.log(' scanning_to_index ', comm_dir );
    console.log('Scannin comments Dir :: -> ');

    // let id_folders = await getFiles(comm_dir);

    // id_folders = id_folders.filter(dir => dir.indexOf('DS_Store') == -1);
    let id_folders = fs.readdirSync(comm_dir);

    // let index_key = thisWorker.config.connections_index_key_maps[conn];
    // thisWorker.indexObj[index_key] = thisWorker.indexObj[index_key] || {};
    // thisWorker.cacheObj[index_key] = thisWorker.cacheObj[index_key] || {};

    id_folders.forEach(each_id_folder => {

        // console.log('each_id_folder -->', each_id_folder );
        if (fs.lstatSync(`${comm_dir}/${each_id_folder}`).isDirectory()) {



            // thisWorker.indexObj[index_key][each_id_folder] = thisWorker.indexObj[index_key][each_id_folder] || {};

            // thisWorker.indexObj[each_id_folder] = thisWorker.indexObj[each_id_folder] || {};
            thisWorker.cacheObj[each_id_folder] = thisWorker.cacheObj[each_id_folder] || {};

            // @@ read the .sqydf files in node
            fs.readdirSync(`${comm_dir}/${each_id_folder}`).forEach(async (comm_json_file, i) => {


                if (/[(.json)]$/.test(comm_json_file)) {

                    let comment_doc = fs.readFileSync(`${comm_dir}/${each_id_folder}/${comm_json_file}`, 'utf8');

                    let _id = comm_json_file.slice(0, -5);

                    console.log(' _id -------->', _id, '\n comm_dir :: ->', conn);

                    // @@ slice o excluse .json in naming set as key on cache 
                    thisWorker.cacheObj[each_id_folder][_id] = JSON.parse(comment_doc);

                    // const html_to_extract = JSON.parse(fs.readFileSync(`${files_folder}${filo}`,'utf8'); 

                    // sqydf_file = null; _id = null;

                }


            })

        }


    });



};



thisWorker.persist_comment = async function (options) {

    let existingDataPath = thisWorker.config.db_data_dir + '/' + 'cpx_comments/' + options.resourceId;

    // let file_exists = fs.existsSync(`${existingDataPath}/${options.file_name}.sqydf`);

    // console.log('existingDataPath 00 --->', existingDataPath, options.file_name, file_exists);

    return new Promise((resolve, reject) => {

        let write_file_to_disk = async function () {

            // const the_data_file = Bun.file(`${existingDataPath}/${options.file_name}.sqydf`);
            // let new_file = '', file_exists = await the_data_file.exists();

            await Bun.write(`${existingDataPath}/${options.commentId}.json`, options.comment);
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



thisWorker.persist_admin_report = async function (options) {

    let existingDataPath = thisWorker.config.db_data_dir + '/' + 'admin_report/';

    // let file_exists = fs.existsSync(`${existingDataPath}/${options.file_name}.sqydf`);

    // console.log('existingDataPath 00 --->', existingDataPath, options.file_name, file_exists);

    return new Promise((resolve, reject) => {

        let write_file_to_disk = async function () {

            // const the_data_file = Bun.file(`${existingDataPath}/${options.file_name}.sqydf`);
            // let new_file = '', file_exists = await the_data_file.exists();

            await Bun.write(`${existingDataPath}/admin_report.json`, options.admin_report);
            // fs.writeFileSync(`${existingDataPath}/${options.file_name}.sqydf`, new_file);

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


// @@ scan the ids in each directory to index
thisWorker.fetch_admin_report = async function (comm_dir, conn) {

    // @@ -- This 

    // let id_folders = await getFiles(comm_dir);
    let adminReportDir = thisWorker.config.db_data_dir + '/' + 'admin_report/';
    let isDirectory = fs.lstatSync(`${adminReportDir}`).isDirectory();

    console.log(' fetch_admin_report running :: -> ', );

    if ( isDirectory ) {

        let admin_report_file = fs.readFileSync(`${adminReportDir}/admin_report.json`, 'utf8');

        // let _id = admin_report_file.slice(0, -5);
        // console.log(' Admin report read -------->', '\n  :: ->', admin_report_file );

        // @@ slice o excluse .json in naming set as key on cache 
        thisWorker.admin_report = JSON.parse(admin_report_file);

        // const html_to_extract = JSON.parse(fs.readFileSync(`${files_folder}${filo}`,'utf8'); 

    }

    else {
        thisWorker.admin_report = {};
    }



};