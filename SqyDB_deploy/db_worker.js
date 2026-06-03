// connections_worker

// import { readdir } from 'node:fs/promises';
import fs from 'node:fs';
import { unlink } from "node:fs/promises";

// import { join } from 'node:path';
const { check_or_setup_collection } = await import('./_lib_/check_or_setup_collection.js');

const thisWorker = {};


// thisWorker.count = 0;

// thisWorker.indexObj = {};

// thisWorker.cacheObj = {};

// thisWorker.admin_report = {};

// @@ --list dir BUn

// https://bun.sh/docs/api/glob

// https://stackoverflow.com/questions/77097856/list-files-in-directory-with-bun

// import { Glob } from "bun";

// const glob = new Glob("*");

// for (const file of glob.scanSync(".")) {
//     console.log(file);
// }


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

        console.log('db Message received ::: ---- >', event.data);

    }, 600);

    // const work_id = event.data.job + '_' + Date.now();
    // const work_id = event.data.job + '_' + Date.now();

    // let job = { ...event.data };
    thisWorker.config = event.data.config;

    if (typeof thisWorker[event.data.fnc] == 'function') {

        await thisWorker[event.data.fnc](event.data, process);

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

    console.log(' Job done . db_worker ---->', event.data.fnc);


});

const check_or_create_dir = async function (pathObj) {

    let path_count = Object.keys(pathObj).length;
    let done = 0;
    const all_done = function (resolve) {

        if (done == path_count) {
            resolve('OK');
        }
    }

    return new Promise((resolve, reject) => {

        for (const key in pathObj) {

            let path = pathObj[key];

            console.log('the path -->', key, path)

            if (!fs.existsSync(path)) {

                fs.mkdir(path, (err) => {

                    done++
                    all_done(resolve);
                })
            }

            else {
                done++;
                all_done(resolve);
            }

        }
    })


};

const persist_to_disk_ = async function (path, name, content) {

    // @@ check dir meta if 200k has been exceeded
    content = typeof content !== 'string' ? JSON.stringify(content) : content;
    await Bun.write(`${path}/${name}`, content);

    return 'OK'
}



thisWorker.persist_batch_fnc = async function (options_, process) {

    // @@ -- fpr Each Batc Data

    console.log(' Time to run Batch updates ');

    // options_.batch.forEach(async (batch_data) => {

    //     let _id = batch_data._id;
    //     let data_path = options_.dir + `/${batch_data.collection}/` + _id.split('V')[2]; //.padStart(6, "0");

    //     let dataToPersist_ = fs.readFileSync(`${data_path}/${_id}.json`, 'utf8');

    //     let exDoc = JSON.parse(dataToPersist_);

    //     exDoc[batch_data.key] = batch_data.value;

    //     await persist_to_disk_(data_path, `${_id}.json`, exDoc);

    //     dataToPersist_ = null; exDoc = null;


    // });

    try {

        let u = options_.batch.length - 1;

        const run_update = async function () {

            if (u == -1) {

                console.log(' All Batch updates done ');
                process.exit();
            }

            else {

                let batch_data = options_.batch[u];

                let _id = batch_data._id;
                let data_path = options_.dir + `/${batch_data.collection}/` + _id.split('V')[2]; //.padStart(6, "0");

                let dataToPersist_ = fs.readFileSync(`${data_path}/${_id}.json`, 'utf8');

                let exDoc = JSON.parse(dataToPersist_);

                exDoc[batch_data.key] = batch_data.value;

                await persist_to_disk_(data_path, `${_id}.json`, exDoc);

                dataToPersist_ = null; exDoc = null;

                u--;
                run_update();

            }



        }


        run_update();


    } catch (error) {


        console.log(' persist_batch_fnc error :: --> ', error )

    }



};

thisWorker.set_doc_to_disk = async function (options_) {


    console.log('worker setting --->', options_);

    // const bytes = await Bun.write(options_.path_plus_item_id + '.json', JSON.stringify(options_.data));
    let file_cont = JSON.stringify(options_.data || options_.postData);

    // https://bun.sh/blog/bun-v1.0.16
    await Bun.write(options_.path_plus_item_id + '.json', file_cont);

    // fs.writeFile(options_.path_plus_item_id + '.json', file_cont, (err) => {
    //     if (err)  {
    //         console.log(err);
    //     }
    //     else {
    //       console.log("File written successfully\n");
    //     //   console.log("The written has the following contents:");
    //     //   console.log(fs.readFileSync("books.txt", "utf8"));
    //     }
    //   });


    if (options_.admin_report) {

        console.log('Adminm reproting  :: --- >', `${options_.dir}/_admin_report/`, options_.admin_report);
        await persist_to_disk_(`${options_.dir}/_admin_report/`, `admin_report.json`, options_.admin_report);
    }



    // console.log('conn add_creator_connection :: -> ', options_.add_creator_connection );

    if (options_.authorData) {

        let idd = options_.authorData._id;
        let mainData2Path = options_.dir + '/cpx_users/' + idd.split('V')[2]; //.padStart(6, "0");
        await persist_to_disk_(mainData2Path, `${idd}.json`, options_.authorData);
    }

    if (options_.entityAuthorData) {

        let idd = options_.entityAuthorData._id;
        let mainData2Path = options_.dir + '/cpx_entity/' + idd.split('V')[2]; //.padStart(6, "0");
        await persist_to_disk_(mainData2Path, `${idd}.json`, options_.entityAuthorData);
    }

    if (options_.postData && options_.add_creator_connection) {

        let paths = {
            author: options_.dir + `/_connections/${options_.add_creator_connection.author}/` + options_.postData.postAuthor.authorId
        };

        if (options_.add_creator_connection.entity) {
            paths.entity = options_.dir + `/_connections/${options_.add_creator_connection.entity}/` + options_.postData.postEntity._id;
        }

        // console.log('conn paths :: -> ', paths );
        // @@ check that directoris exist
        // let dirsExists = 
        // await check_or_create_dir(paths);
        let post_id = options_.postData._id;
        let post_date = options_.postData.$created_on$;


        // @@ write the files to respectivd d=
        // @@ write a meta file that holds dir files count etc.. then know when to create new dir
        // @@ after exceed say, 200k limits per dir

        // "linux maximum number of files in a directory" -- for insights
        await persist_to_disk_(paths.author, `${post_id}.json`, { $created_on$: post_date });

        if (options_.add_creator_connection.entity) {
            await persist_to_disk_(paths.entity, `${post_id}.json`, { $created_on$: post_date, author: options_.postData.postAuthor.authorId });
        }

    }

    // console.log( 'done writing -->', bytes );

    // if (bytes > 0) {
    //     return 'done'
    // }

    process.exit();
};

thisWorker.unset_doc_form_disk = async function (options_) {

    // const bytes = await Bun.write(options_.path_plus_item_id + '.json', JSON.stringify(options_.data));

    // await Bun.write(options_.path_plus_item_id + '.json', JSON.stringify(options_.data));
    await unlink(`${options_.path_plus_item_id}.json`);

    // console.log( 'done writing -->', bytes );

    // if (bytes > 0) {
    //     return 'done'
    // }
    process.exit();
};

const check_or_create_dir_old = async function (pathObj) {

    let path_count = Object.keys(pathObj).length;
    let done = 0;
    const all_done = function (resolve) {

        if (done == path_count) {
            resolve('OK');
        }
    }

    return new Promise((resolve, reject) => {

        for (const key in pathObj) {

            let path = pathObj[key];

            if (!fs.existsSync(path)) {

                fs.mkdir(path, (err) => {

                    done++
                    all_done(resolve);
                })
            }

            else {
                done++;
                all_done(resolve);
            }

        }
    })


}


// if (fs.lstatSync(`${comm_dir}/${each_id_folder}`).isDirectory()) {}


thisWorker.persist_comment = async function (options, process) {


    // console.log(' Time to Persist likes --->', options.dir, options.post_id, options.user_id, 'options.postData ');
    // console.log(' Time to Entity linkup --->', options, 'options.postData ');

    try {


        let paths = {

            // comment0: options.dir + '/_comments/' + options.commentId + '/', // @@ the comment_parent resource folder first
            comment: options.dir + '/_comments/' + options.resourceId + '/' + options.commentId.split('V')[2],
            author: options.dir + `/_connections/posts_users_commented_on/` + options.authorId,
            resource: options.dir + '/' + options.resource_collection + '/' + options.resourceId.split('V')[2]

        };

        let mainDataId = options.resourceDoc._id;
        // let mainDataPath = options.dir + '/cpx_users/' + mainDataId.split('V')[1].padStart(6, "0");

        // let mainData2Id = options.acting_user_data._id;
        // let mainData2Path = options.dir + '/cpx_users/' + mainData2Id.split('V')[1].padStart(6, "0");

        // @@ check that directoris exist
        // let dirsExists = await check_or_create_dir(paths);


        // @@ write the files to respectivd d=
        // @@ write a meta file that holds dir files count etc.. then know when to create new dir
        // @@ after exceed say, 200k limits per dir

        // "linux maximum number of files in a directory" -- for insights
        await persist_to_disk_(paths.comment, `${options.commentId}.json`, options.comment);

        // @@ -- Post user \commented on.. just post ID  saved.. no matter no of comments
        await persist_to_disk_(paths.author, `${mainDataId}.json`, { $created_on$: options._date_ });

        await persist_to_disk_(paths.resource, `${mainDataId}.json`, options.resourceDoc);
        // await persist_to_disk_(mainData2Path, `${mainData2Id}.json`, options.acting_user_data );



        await persist_to_disk_(`${options.dir}/_admin_report/`, `admin_report.json`, options.admin_report);

        console.log(' set Comment to disk --->', 'dirsExists');

        process.exit();



    } catch (error) {

        console.log('Worker Err ->', error);

    }


};

thisWorker.persist_user_follow = async function (options, process) {


    // console.log(' Time to Persist likes --->', options.dir, options.post_id, options.user_id, options );
    // console.log(' Time to Entity linkup --->', options, 'options.postData ');

    try {


        let paths = {

            subjectId: `${options.dir}/_connections/users_followers/${options.subjectId}/${options.subjectId_track.last_node_dir}`,
            actorId: `${options.dir}/_connections/users_followings/${options.actorId}/${options.actorId_track.last_node_dir}`,

        };

        let mainDataId = options.user_to_follow_data._id;
        let mainDataPath = options.dir + '/cpx_users/' + mainDataId.split('V')[2]; //.padStart(6, "0");

        let mainData2Id = options.acting_user_data._id;
        let mainData2Path = options.dir + '/cpx_users/' + mainData2Id.split('V')[2]; //.padStart(6, "0");

        // @@ check that directoris exist
        // let dirsExists = await check_or_create_dir_old(paths);
        // let dirsExists = await check_or_create_dir(paths);
        let now_ = Date.now();


        // @@ write the files to respectivd d=
        // @@ write a meta file that holds dir files count etc.. then know when to create new dir
        // @@ after exceed say, 200k limits per dir

        // "linux maximum number of files in a directory" -- for insights
        await persist_to_disk_(paths.subjectId, `${options.actorId}.json`, { $t: now_, $created_on$: options._date_ });
        await persist_to_disk_(paths.actorId, `${options.subjectId}.json`, { $t: now_, $created_on$: options._date_ });

        await persist_to_disk_(mainDataPath, `${mainDataId}.json`, options.user_to_follow_data);
        await persist_to_disk_(mainData2Path, `${mainData2Id}.json`, options.acting_user_data);

        await persist_to_disk_(`${options.dir}/_admin_report/`, `admin_report.json`, options.admin_report);

        console.log(' set User follow up to disk --->', 'dirsExists', mainData2Path);

        process.exit();



    } catch (error) {

        console.log('Worker Err ->', error);

    }


};

thisWorker.unpersist_user_follow = async function (options, process) {


    // console.log(' Time to Persist likes --->', options.dir, options.post_id, options.user_id, 'options.postData ');
    // console.log(' Time to Entity linkup --->', options, 'options.postData ');

    try {

        let u_conn = options.type == "Page" ? 'pages_user_follow' : 'groups_user_joined';


        let paths = {

            subjectId: `${options.dir}/_connections/users_followers/${options.subjectId}/1/${options.actorId}`,
            actorId: `${options.dir}/_connections/users_followings/${options.actorId}/1/${options.subjectId}`,
        };

        let mainDataId = options.user_to_follow_data._id;
        let mainDataPath = options.dir + '/cpx_users/' + mainDataId.split('V')[2]; //.padStart(6, "0");

        let mainData2Id = options.acting_user_data._id;
        let mainData2Path = options.dir + '/cpx_users/' + mainData2Id.split('V')[2]; //.padStart(6, "0");

        // @@ check that directoris exist

        // @@ write the files to respectivd d=
        // @@ write a meta file that holds dir files count etc.. then know when to create new dir
        // @@ after exceed say, 200k limits per dir

        // "linux maximum number of files in a directory" -- for insights
        // unlink(`${paths.subjectId}.json`, options.subject_dir_count, function() {


        // });
        // unlink(`${paths.actorId}.json`, options.actor_dir_count, function() {


        // });

        // @@ -- send it to unlink connection queue... responsible for looking for the file and purging

        // subject_dir_count ----->>> for unlinker to know how many dirs to scan in this id
        // -- in order to look for file

        unlink(`${paths.subjectId}.json`, options.subject_dir_count);
        unlink(`${paths.actorId}.json`, options.actor_dir_count);


        await persist_to_disk_(mainDataPath, `${mainDataId}.json`, options.user_to_follow_data);
        await persist_to_disk_(mainData2Path, `${mainData2Id}.json`, options.acting_user_data);

        await persist_to_disk_(`${options.dir}/_admin_report/`, `admin_report.json`, options.admin_report);

        console.log(' unset Entity link up from disk --->', 'dirsExists');

        process.exit();



    } catch (error) {

        console.log('Worker Err ->', error);

    }


};



thisWorker.persist_entity_linkup = async function (options, process) {


    // console.log(' Time to Persist likes --->', options.dir, options.post_id, options.user_id, 'options.postData ');
    // console.log(' Time to Entity linkup --->', options, 'options.postData ');

    try {

        let u_conn = options.type == "Page" ? 'pages_user_follow' : 'groups_user_joined';

        let paths = {

            // entity: options.dir + '/_connections/entity_linkup/' + options.entity_id,
            // user: options.dir + `/_connections/${u_conn}/` + options.user_id,
            entity: `${options.dir}/_connections/entity_linkup/${options.entity_id}/${options.entity_id_track.last_node_dir}`,
            user: `${options.dir}/_connections/${u_conn}/${options.user_id}/${options.user_id_track.last_node_dir}`,

        };

        let mainDataId = options.entityData._id;
        let mainDataPath = options.dir + '/cpx_entity/' + mainDataId.split('V')[2]; //.padStart(6, "0");

        let mainData2Id = options.userData._id;
        let mainData2Path = options.dir + '/cpx_users/' + mainData2Id.split('V')[2]; //.padStart(6, "0");

        // @@ check that directoris exist
        // let dirsExists = await check_or_create_dir_old(paths);
        // let dirsExists = await check_or_create_dir(paths);

        let _date_ = new Date();
        _date_ = _date_.toISOString();

        let $t = Date.now();

        // @@ write the files to respectivd d=
        // @@ write a meta file that holds dir files count etc.. then know when to create new dir
        // @@ after exceed say, 200k limits per dir

        // "linux maximum number of files in a directory" -- for insights
        await persist_to_disk_(paths.entity, `${options.user_id}.json`, { $t, $created_on$: _date_ });
        await persist_to_disk_(paths.user, `${options.entity_id}.json`, { $t, $created_on$: _date_ });

        await persist_to_disk_(mainDataPath, `${mainDataId}.json`, options.entityData);
        await persist_to_disk_(mainData2Path, `${mainData2Id}.json`, options.userData);

        await persist_to_disk_(`${options.dir}/_admin_report/`, `admin_report.json`, options.admin_report);

        console.log(' set Entity link up to disk --->', 'dirsExists');

        process.exit();



    } catch (error) {

        console.log('Worker Err ->', error);

    }


};


thisWorker.unpersist_entity_linkup = async function (options, process) {


    // console.log(' Time to Persist likes --->', options.dir, options.post_id, options.user_id, 'options.postData ');
    // console.log(' Time to Entity linkup --->', options, 'options.postData ');

    try {

        let u_conn = options.type == "Page" ? 'pages_user_follow' : 'groups_user_joined';


        let paths = {
            // entity: options.dir + '/_connections/entity_linkup/' + options.entity_id + '/' + options.user_id,
            // user: options.dir + `/_connections/${u_conn}/` + options.user_id + '/' + options.entity_id,
            entity: `${options.dir}/_connections/entity_linkup/${options.entity_id}/1/${options.user_id}`,
            user: `${options.dir}/_connections/${u_conn}/${options.user_id}/1/${options.entity_id}`,
        };

        let mainDataId = options.entityData._id;
        let mainDataPath = options.dir + '/cpx_entity/' + mainDataId.split('V')[2]; //.padStart(6, "0");

        let mainData2Id = options.userData._id;
        let mainData2Path = options.dir + '/cpx_users/' + mainData2Id.split('V')[2]; //.padStart(6, "0");

        // @@ check that directoris exist

        // @@ write the files to respectivd d=
        // @@ write a meta file that holds dir files count etc.. then know when to create new dir
        // @@ after exceed say, 200k limits per dir

        // "linux maximum number of files in a directory" -- for insights
        // await persist_to_disk_(paths.entity, `${options.user_id}.json`, { $created_on$: _date_});
        // await persist_to_disk_(paths.user, `${options.entity_id}.json`, { $created_on$: _date_});
        unlink(`${paths.entity}.json`);
        unlink(`${paths.user}.json`);


        await persist_to_disk_(mainDataPath, `${mainDataId}.json`, options.entityData);
        await persist_to_disk_(mainData2Path, `${mainData2Id}.json`, options.userData);

        await persist_to_disk_(`${options.dir}/_admin_report/`, `admin_report.json`, options.admin_report);

        console.log(' unset Entity link up from disk --->', 'dirsExists');

        process.exit();



    } catch (error) {

        console.log('Worker Err ->', error);

    }


};





thisWorker.persist_post_like = async function (options, process) {


    // console.log(' Time to Persist likes --->', options.dir, options.post_id, options.user_id, 'options.postData ');

    try {
        // let paths = {
        //     post: options.dir + '/_connections/' + options.post_id,
        //     user: options.dir + '/_connections/' + options.user_id,
        //     postlike: options.dir + '/_connections/' + options.post_id + '/post_likes',
        //     postUserlike: options.dir + '/_connections/' + options.user_id + '/post_likes',
        // };

        let paths = {
            // post: options.dir + '/_connections/post_likes/' + options.post_id,
            // user: options.dir + '/_connections/posts_users_reacted_to/' + options.user_id,

            post: `${options.dir}/_connections/post_likes/${options.post_id}/${options.post_id_track.last_node_dir}`,
            user: `${options.dir}/_connections/posts_users_reacted_to/${options.user_id}/${options.user_id_track.last_node_dir}`,

            // entity: `${options.dir}/_connections/post_likes/${options.entity_id}/1/${options.user_id}`,
            // user: `${options.dir}/_connections/posts_users_reacted_to/${options.user_id}/1/${options.entity_id}`,
        };

        let mainDataId = options.postData._id;
        let mainDataPath = options.dir + '/cpx_posts/' + mainDataId.split('V')[2];//.padStart(6, "0");

        let mainData2Id = options.userData._id;
        let mainData2Path = options.dir + '/cpx_users/' + mainData2Id.split('V')[2];//.padStart(6, "0");

        // @@ check that directoris exist
        // let dirsExists = await check_or_create_dir_old(paths);
        // let dirsExists = await check_or_create_dir(paths);

        let _date_ = new Date();
        _date_ = _date_.toISOString();

        let $t = Date.now();

        // @@ write the files to respectivd d=
        // @@ write a meta file that holds dir files count etc.. then know when to create new dir
        // @@ after exceed say, 200k limits per dir

        // "linux maximum number of files in a directory" -- for insights
        await persist_to_disk_(paths.post, `${options.user_id}.json`, { $t, $created_on$: _date_ });
        await persist_to_disk_(paths.user, `${options.post_id}.json`, { $t, $created_on$: _date_ });

        await persist_to_disk_(mainDataPath, `${mainDataId}.json`, options.postData);
        await persist_to_disk_(mainData2Path, `${mainData2Id}.json`, options.userData);

        console.log(' set Post like to disk Exists --->', 'dirsExists', 'isPersisted_post', 'isPersisted_user', 'isPersisted_PostData');

        process.exit();

    } catch (error) {

        console.log('Worker Err ->', error);

    }


};


thisWorker.unpersist_post_like = async function (options, process) {


    console.log(' Time to unPersist like --->', options.dir, options.post_id, options.user_id, 'options.postData ');

    try {


        let paths = {
            post: `${options.dir}/_connections/post_likes/${options.post_id}/1/${options.user_id}`,
            user: `${options.dir}/_connections/posts_users_reacted_to/${options.user_id}/1/${options.post_id}`,
        };

        let mainDataId = options.postData._id;
        let mainDataPath = options.dir + '/cpx_posts/' + mainDataId.split('V')[2];//.padStart(6, "0");

        // @@ check that directoris exist

        // @@ write the files to respectivd d=
        // @@ write a meta file that holds dir files count etc.. then know when to create new dir
        // @@ after exceed say, 200k limits per dir

        // "linux maximum number of files in a directory" -- for insights

        unlink(`${paths.post}.json`);
        unlink(`${paths.user}.json`);

        let isPersisted_PostData = await persist_to_disk_(mainDataPath, `${mainDataId}.json`, options.postData);

        console.log(' unset Post like from disk ---> ', isPersisted_PostData);

        process.exit();



    } catch (error) {

        console.log('Worker Err ->', error);

    }


};


thisWorker.check_or_setup_collection = async function (options, process) {


    try {

        console.log(' check_or_setup_collection function running ---->');

        check_or_setup_collection(options);

        process.exit();


    } catch (error) {

        console.log('error 00 --> ', error);

    }
}





