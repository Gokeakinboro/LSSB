
import fs from 'node:fs';
import { unlink } from "node:fs/promises";

import { join } from 'node:path';

const { config } = await import('./_config.js');

// const persistWorker = new Worker("./Persist.js");

// const { _set } = await import('./_lib_/_set.js');

// const { _get } = await import('./_lib_/_get.js');

const { _u } = await import('./_lib_/_u.js');



const { scan_and_cache_collections } = await import('./_lib_/scan_and_cache_collections.js');

// const { _check_exists } = await import('./_lib_/_check_exists.js');

// const { _reset } = await import('./_lib_/_reset.js');

// const { _unset } = await import('./_lib_/_unset.js');

const { filter_engine } = await import('./_lib_/filter_engine.js');

// const { db_fncs } = await import('./_lib_/db_fncs.js');

const SqyDB = {};

let connectionIndex = {};

let commentsIndex = {};

let commentsCache = {};

let SqyDB_stats = {};

let SqyDB_Cache = {};

let SqyDB_sort_cache = {};

let SqyDB_index = { _id: {}, others: {} };

let admin_report = {};

SqyDB.fncs = {};

SqyDB.db_ops = {};

SqyDB.is_caching = false;

SqyDB.is_persisting = false;

SqyDB.isWorking = false;

SqyDB.db_ready = false;

// @@ attache socket here
SqyDB.connect = { cache: {}, worker: {} };

SqyDB.connection_state = {};

let SqyDB_Worker_Queue = {};

// queue_cache_persist

const queueOne = new Map();

// @@ Set --- 
let set_hit = 0;


const value_from_key_depth = function (key, data) {
    let a;
    if (key.indexOf('.') > -1) {

        // console.log('key dot', key);
        a = key.split('.');
        a = a.map(ei => ei.trim());

        // $null means key value doesn't exist... no need to proceed with check
        // --- 
        if (typeof data[a[0]] == 'undefined') { return '$null' }

        // @@ for 2 e.g _fields._sex
        if (a.length == 2) {

            if (typeof data[a[0]][a[1]] == 'undefined') { return '$null' }
            return data[a[0]][a[1]]

        }

        if (a.length == 3) {

            if (typeof data[a[0]][a[1]] == 'undefined') { return '$null' }
            if (typeof data[a[0]][a[1]][a[2]] == 'undefined') { return '$null' }

            return data[a[0]][a[1]][a[2]]

        }


        // ['_fields.academics.school.course'] = ['_fields', 'academics', 'school', 'course']
        if (a.length == 4) {


            if (typeof data[a[0]][a[1]] == 'undefined') { return '$null' }
            if (typeof data[a[0]][a[1]][a[2]] == 'undefined') { return '$null' }
            if (typeof data[a[0]][a[1]][a[2]][a[3]] == 'undefined') { return '$null' }

            return data[a[0]][a[1]][a[2]][a[3]]

        }

        if (a.length == 5) {


            if (typeof data[a[0]][a[1]] == 'undefined') { return '$null' }
            if (typeof data[a[0]][a[1]][a[2]] == 'undefined') { return '$null' }
            if (typeof data[a[0]][a[1]][a[2]][a[3]] == 'undefined') { return '$null' }
            if (typeof data[a[0]][a[1]][a[2]][a[3]][a[4]] == 'undefined') { return '$null' }

            return data[a[0]][a[1]][a[2]][a[3]][a[4]]

        }


    }

    // console.log('data[key]', key, data, data[key] );

    return data[key] || "$null"
}


const db_fncs = {};



SqyDB.db_ops.set = async function (options) {

    try {

        set_hit++;
        // console.log('set hit KBU -=====>', set_hit );

        // return { _id: '_AABBCC', msg: 'OK' }

        if (!SqyDB.isReady) { return { msg: 'DB NOT READY' } }

        // let ops_res = await _set(options, SqyDB_Cache, SqyDB_stats, SqyDB.db_node, config.dbn_prefix);

        // console.log('set Ops Resm-====>', ops_res );


        if (typeof options.data == 'undefined') { return { msg: 'No data provided' } }

        /* 
        * @@ 1. Generate a unique id 
        * @@ 2. save to cache -- might be needed soon 
        * @@ 3. save to BD Queue so job workers can persist on disk
        * 
        *!*/

        // console.log('set hit', options, SqyDB_stats, options.collection, '\n this coll stats --><>><>>>>', SqyDB_stats[options.collection]);


        // return { _id: 'null', msg: 'OK' }
        // * @@ 1. Generate a unique id 
        // @@ this helps solves the order_of_creation problem
        // -- OS folders can now archive based on  numbering
        // let last_num = SqyDB_stats[options.collection].last_num;
        // let last_node_dir = SqyDB_stats[options.collection].last_node_dir;

        // @@ Set last num and last node
        // -- if it's config.db_node_limitth num we move to the next node folder and start from 1
        SqyDB_stats[options.collection].last_num--;

        if (SqyDB_stats[options.collection].last_num === 0) {

            SqyDB_stats[options.collection].last_num = config.db_node_limit;
            SqyDB_stats[options.collection].last_node_dir++;


        }


        // last_num = last_num == config.db_doc_limit ? 0 : last_num + 1;
        // last_node_dir = last_num == config.db_doc_limit ? last_node_dir + 1 : last_node_dir;

        // "dn10001z1b7D0O7T9p1u2O2m115o4p558001"

        // let _last_node_dir = _u.preceeder_(SqyDB_stats[options_.collection].last_node_dir, 5);

        // let _id = config.dbn_prefix + _u.preceeder_(last_num, 4) + gen_id().substring(0, 12) + _last_node_dir;

        let _id = '';

        function check_id() {

            // let _id = dbn_prefix + _u.preceeder_(last_num, 4) + _u.gen_id() + _last_node_dir;
            // if () {}
            // Num in folder / node folder / id / host id = dbn_prefix /  node on host
            let _id = SqyDB_stats[options.collection].last_num + 'V' + SqyDB_stats[options.collection].last_node_dir + 'V' + _u.gen_id() + 'V' + config.dbn_prefix + 'V' + SqyDB.db_node;

            if (SqyDB_index[options.collection][_id]) {

                _id = check_id(_id)
            }
            else {
                return _id;
            }

        };

        _id = check_id();

        // @@ set data id
        options.data._id = _id;


        // @@ index _id and any other data key
        // SqyDB_index[options.collection][_id] = _id;

        // console.log(' SqyDB_stats[options.collection].co -->', SqyDB_stats, 'options.data._id --->', options.data._id );

        SqyDB_stats[options.collection].collection_index.forEach(indx => {



            // if ( options.data[indx] && SqyDB_index[options.collection][indx]) {
            if (indx == '_id' && value_from_key_depth(indx, options.data) !== '$null' && SqyDB_index[options.collection][indx]) {
                SqyDB_index[options.collection][indx][options.data[indx]] = options.data._id;
            }

            if (indx !== '_id' && value_from_key_depth(indx, options.data) !== '$null') {
                SqyDB_index[options.collection]['others'][value_from_key_depth(indx, options.data)] = options.data._id;
            }

        })

        // console.log(' After Post -->', SqyDB_index[options.collection]);

        // @@ set time
        options.data['$t$'] = Date.now();


        // @@ --- cache -=====================-----------------------------==
        SqyDB_Cache[options.collection][_id] = options.data;

        if (config.sort_collection.indexOf(options.collection) > -1) {

            SqyDB_sort_cache[options.collection].unshift({

                $t$: options.data['$t$'],
                _id
            })
        }


        // console.log( ' in _set -----> now setting ---> ', options.data, 'gen_id()' );

        // return { _id: 'hfyht6uijhbhh909', msg: 'OK' }

        // let path_plus_item_id = config.db_data_dir + '/' + options.collection + '/' + _u.preceeder_(SqyDB_stats[options.collection].last_node_dir, 5) + '/' + _id;
        let path_plus_item_id = config.db_data_dir + '/' + options.collection + '/' + ("" + SqyDB_stats[options.collection].last_node_dir).padStart(6, "0") + '/' + _id;

        // console.log('in _set --- Time to cache and persist -->>>>', {
        //     path_plus_item_id,
        //     data: options.data
        // })

        // console.log('in _set --- 225 -->>>>', options);

        if (options.$afterSetFnc && typeof db_fncs[options.$afterSetFnc] == 'function') {

            db_fncs[options.$afterSetFnc](options.data, options);
        }


        // @@ you were working on persisting via worker
        SqyDB.fncs.queue_cache_persist({
            type: 'write',
            path_plus_item_id,
            data: options.data
        })

        return { _id, msg: 'OK' }



    } catch (error) {

        console.log('set error -->', error)

        return { msg: 'Error' }

    }

};



// @@ Collections in chronological or reverse chron order
SqyDB.db_ops.fetch_admin_report = async function (options) {


    // console.log('Fetch admin report ::: ---> ', options);

    return {

        msg: 'OK', admin_report
    }


    // return {

    //     msg: 'OK', report: {

    //         grants_count: SqyDB_sort_cache['LSSB_grants'].length,
    //         applicants_count: SqyDB_sort_cache['LSSB_applicants'].length,
    //         applications_count: SqyDB_sort_cache['LSSB_applications'].length,
    //         bursary_count: 0,
    //         scholarship_count: 0,
    //         total_pending_pay: 0,

    //     }
    // }

};

// voko

// @@ enity should increase linkup count

// @@ entity should get link-up record saved

// @@ -- Link-up user should have record saved in pages_user_follow or group_user_joined

// @@ -- saved as -- id:date~~type e.g id:date~~type


db_fncs.after_create_entity = async function (data) {


    try {


        let d = SqyDB_Cache['cpx_entity'][data._id];



        let type = data._fields.entity_type;

        let actorId = data.user_id || data.actorId

        let userD = SqyDB_Cache['cpx_users'][actorId];

        // console.log(' after post ran  :: ---> ', d );

        if (d && d._id) {

            d.$connections$ = d.$connections$ || {};

            d.$connections$.linkups = d.$connections$.linkups || 0;

            d.$connections$.linkups++;

            SqyDB_Cache['cpx_entity'][data._id] = d;

            // @@ --- persist straight up
            let options = {
                collection: 'cpx_entity'
            };

            // @@ update admin report as well...
            // admin_report.posts_count = admin_report.posts_count || 0;

            // admin_report.posts_count++

            SqyDB.fncs.reCache_and_persist_updated_doc(SqyDB_Cache['cpx_entity'][data._id], options);



            let current_count = (parseInt(d.$connections$.linkups / 100) + 1) * 100;
            let entity_file_name = current_count;

            let user_connection_persist_collection = "$groups_user_joined";

            let user_count_file_name = '';

            userD.$connections$ = userD.$connections$ || {};

            if (type == "Page") {

                user_connection_persist_collection = "$pages_user_follow";

                userD.$connections$.page_join_count = userD.$connections$.page_join_count || 0;
                userD.$connections$.page_join_count++;

                user_count_file_name = (parseInt(userD.$connections$.page_join_count / 100) + 1) * 100;

                admin_report.pages_count = admin_report.pages_count || 0;

                admin_report.pages_count++

            }

            else {

                userD.$connections$.group_follow_count = userD.$connections$.group_follow_count || 0;
                userD.$connections$.group_follow_count++;

                user_count_file_name = (parseInt(userD.$connections$.group_follow_count / 100) + 1) * 100;


                admin_report.groups_count = admin_report.groups_count || 0;

                admin_report.groups_count++

            }

            // @@ set indexes -- == --- //  00 //
            connectionIndex.$entity_linkup = connectionIndex.$entity_linkup || {};
            connectionIndex.$entity_linkup[data._id] = connectionIndex.$entity_linkup[data._id] || {};
            connectionIndex.$entity_linkup[data._id][actorId] = entity_file_name;

            SqyDB_Cache['cpx_users'][actorId] = userD;

            // let current_user_group_join_count = (parseInt(d.$connections$.linkups / 100) + 1) * 100;
            // let current_user_page_follow_count = (parseInt(d.$connections$.linkups / 100) + 1) * 100;

            SqyDB.fncs.reCache_and_persist_updated_doc(SqyDB_Cache['cpx_users'][actorId], {
                collection: 'cpx_users'
            });

            // @@ persist connection -- / -- / 
            // --- @@ -- humans 
            const persistWorker = new Worker("./connections_worker.js", {
                smol: true,
            });

            // @@ persist connections for Entity...
            let _date_ = new Date();
            _date_ = _date_.toISOString();

            // @@ page user liked or groups joine as separete files..
            // @@ cause users can't like 10,000 pages and join 10 million groups
            persistWorker.postMessage({

                config,
                id: actorId,
                fnc: 'persist_connection_value',
                collection: user_connection_persist_collection,
                value: JSON.stringify(`${d._id}:${_date_}`),
                // as_separate_file: true,
                file_name: user_count_file_name

            });

            // @@ persisting for entity itself.
            persistWorker.postMessage({

                config,
                fnc: 'persist_connection_value',
                id: d._id,
                collection: '$entity_linkup',
                file_name: entity_file_name,
                value: JSON.stringify(`${actorId}:${_date_}`),

            });

            d = null;

             // @@ persist connection
             const commPersistWorker = new Worker("./comments_worker.js", {
                smol: true,
            });

            commPersistWorker.postMessage({

                config,
                fnc: 'persist_admin_report',
                // resourceId: options.comment.resourceId,
                // commentId: _id,
                // collection: '$users_followers',
                admin_report: JSON.stringify(admin_report),
                // value: options.value
            });

        }

    } catch (error) {
        console.log(' error :: ---> ', error);
    }

}

SqyDB.db_ops.linkup_with_entity = async function (options) {


    try {


        let d = SqyDB_Cache['cpx_entity'][options.subjectId];

        let type = options.type;

        let actorId = options.actorId;

        let userD = SqyDB_Cache['cpx_users'][actorId];

        console.log(' linkup ran  :: ---> ', type );

        // return {msg: 'Working' }

        if (d && d._id) {

            d.$connections$ = d.$connections$ || {};

            d.$connections$.linkups = d.$connections$.linkups || 0;

            d.$connections$.linkups++;

            SqyDB_Cache['cpx_entity'][options.subjectId] = d;

            // @@ --- persist straight up
            let options = {
                collection: 'cpx_entity'
            };

            // @@ update admin report as well...
            // admin_report.posts_count = admin_report.posts_count || 0;

            // admin_report.posts_count++

            SqyDB.fncs.reCache_and_persist_updated_doc(SqyDB_Cache['cpx_entity'][options.subjectId], options);



            let current_count = (parseInt(d.$connections$.linkups / 100) + 1) * 100;
            let entity_file_name = current_count;

            let user_connection_persist_collection = "$groups_user_joined";

            let user_count_file_name = '';

            userD.$connections$ = userD.$connections$ || {};

            if (type == "Page") {

                user_connection_persist_collection = "$pages_user_follow";

                userD.$connections$.page_join_count = userD.$connections$.page_join_count || 0;
                userD.$connections$.page_join_count++;

                user_count_file_name = (parseInt(userD.$connections$.page_join_count / 100) + 1) * 100;

            }

            else {

                userD.$connections$.group_follow_count = userD.$connections$.group_follow_count || 0;
                userD.$connections$.group_follow_count++;

                user_count_file_name = (parseInt(userD.$connections$.group_follow_count / 100) + 1) * 100;


                // admin_report.groups_count = admin_report.groups_count || 0;

                // admin_report.groups_count++

            }

            // @@ set indexes -- == --- //  00 //
            connectionIndex.$entity_linkup = connectionIndex.$entity_linkup || {};
            connectionIndex.$entity_linkup[options.subjectId] = connectionIndex.$entity_linkup[options.subjectId] || {};
            connectionIndex.$entity_linkup[options.subjectId][actorId] = entity_file_name;

            SqyDB_Cache['cpx_users'][actorId] = userD;

            // let current_user_group_join_count = (parseInt(d.$connections$.linkups / 100) + 1) * 100;
            // let current_user_page_follow_count = (parseInt(d.$connections$.linkups / 100) + 1) * 100;

            SqyDB.fncs.reCache_and_persist_updated_doc(SqyDB_Cache['cpx_users'][actorId], {
                collection: 'cpx_users'
            });

            // @@ number of follows and likes
            admin_report.connections_count = admin_report.connections_count || 0;
            admin_report.connections_count++

            // @@ persist connection -- / -- / 
            // --- @@ -- humans 
            const persistWorker = new Worker("./connections_worker.js", {
                smol: true,
            });

            // @@ persist connections for Entity...
            let _date_ = new Date();
            _date_ = _date_.toISOString();

            // @@ page user liked or groups joine as separete files..
            // @@ cause users can't like 10,000 pages and join 10 million groups
            persistWorker.postMessage({

                config,
                id: actorId,
                fnc: 'persist_connection_value',
                collection: user_connection_persist_collection,
                value: JSON.stringify(`${options.subjectId}:${_date_}`),
                // as_separate_file: true,
                file_name: user_count_file_name

            });

            // @@ persisting for entity itself.
            persistWorker.postMessage({

                config,
                fnc: 'persist_connection_value',
                id: options.subjectId,
                collection: '$entity_linkup',
                file_name: entity_file_name,
                value: JSON.stringify(`${actorId}:${_date_}`),

            });

            d = null;

             // @@ persist connection
             const commPersistWorker = new Worker("./comments_worker.js", {
                smol: true,
            });

            commPersistWorker.postMessage({

                config,
                fnc: 'persist_admin_report',
                // resourceId: options.comment.resourceId,
                // commentId: _id,
                // collection: '$users_followers',
                admin_report: JSON.stringify(admin_report),
                // value: options.value
            });

        }

    } catch (error) {
        console.log(' error :: ---> ', error);
    }

};


SqyDB.db_ops.unlinkup_with_entity = async function (options) {


    try {


        let d = SqyDB_Cache['cpx_entity'][options.subjectId];

        let type = options.type;

        let actorId = options.actorId;

        let userD = SqyDB_Cache['cpx_users'][actorId];

        console.log(' linkup ran  :: ---> ', type );

        // return {msg: 'Working' }

        if (d && d._id) {

            d.$connections$ = d.$connections$ || {};

            d.$connections$.linkups = d.$connections$.linkups || 0;

            d.$connections$.linkups--;

            SqyDB_Cache['cpx_entity'][options.subjectId] = d;

            // @@ --- persist straight up
            let options = {
                collection: 'cpx_entity'
            };

            // @@ update admin report as well...
            

            SqyDB.fncs.reCache_and_persist_updated_doc(SqyDB_Cache['cpx_entity'][options.subjectId], options);


            let entity_file_name = connectionIndex['$entity_linkup'][options.subjectId][options.actorId];
            delete connectionIndex['$entity_linkup'][options.subjectId][options.actorId];

            // let current_count = (parseInt(d.$connections$.linkups / 100) + 1) * 100;
            // let entity_file_name = current_count;

            let user_connection_persist_collection = "$groups_user_joined";

            let user_count_file_name = '';

            userD.$connections$ = userD.$connections$ || {};

            if (type == "Page") {

                user_connection_persist_collection = "$pages_user_follow";

                userD.$connections$.page_join_count = userD.$connections$.page_join_count || 0;
                userD.$connections$.page_join_count--;

                user_count_file_name = (parseInt(userD.$connections$.page_join_count / 100) + 1) * 100;

            }

            else {

                userD.$connections$.group_follow_count = userD.$connections$.group_follow_count || 0;
                userD.$connections$.group_follow_count--;

                user_count_file_name = (parseInt(userD.$connections$.group_follow_count / 100) + 1) * 100;

                // admin_report.groups_count = admin_report.groups_count || 0;
                // admin_report.groups_count++
            }

            // @@ set indexes -- == --- //  00 //
            connectionIndex.$entity_linkup = connectionIndex.$entity_linkup || {};
            connectionIndex.$entity_linkup[options.subjectId] = connectionIndex.$entity_linkup[options.subjectId] || {};
            connectionIndex.$entity_linkup[options.subjectId][actorId] = entity_file_name;

            SqyDB_Cache['cpx_users'][actorId] = userD;

            // let current_user_group_join_count = (parseInt(d.$connections$.linkups / 100) + 1) * 100;
            // let current_user_page_follow_count = (parseInt(d.$connections$.linkups / 100) + 1) * 100;

            SqyDB.fncs.reCache_and_persist_updated_doc(SqyDB_Cache['cpx_users'][actorId], {
                collection: 'cpx_users'
            });

            // @@ number of follows and likes
            admin_report.connections_count = admin_report.connections_count || 0;
            admin_report.connections_count--

            // @@ persist connection -- / -- / 
            // --- @@ -- humans 
            const persistWorker = new Worker("./connections_worker.js", {
                smol: true,
            });

            // @@ persist connections for Entity...
            let _date_ = new Date();
            _date_ = _date_.toISOString();

            // @@ page user liked or groups joine as separete files..
            // @@ cause users can't like 10,000 pages and join 10 million groups
            persistWorker.postMessage({

                config,
                id: actorId,
                fnc: 'persist_connection_value',
                collection: user_connection_persist_collection,
                value: JSON.stringify(`${options.subjectId}:${_date_}`),
                // as_separate_file: true,
                file_name: user_count_file_name

            });

            // @@ persisting for entity itself.
            persistWorker.postMessage({

                config,
                fnc: 'persist_connection_value',
                id: options.subjectId,
                collection: '$entity_linkup',
                file_name: entity_file_name,
                value: JSON.stringify(`${actorId}:${_date_}`),

            });

            d = null;

             // @@ persist connection
             const commPersistWorker = new Worker("./comments_worker.js", {
                smol: true,
            });

            commPersistWorker.postMessage({

                config,
                fnc: 'persist_admin_report',
                // resourceId: options.comment.resourceId,
                // commentId: _id,
                // collection: '$users_followers',
                admin_report: JSON.stringify(admin_report),
                // value: options.value
            });

        }

    } catch (error) {
        console.log(' error :: ---> ', error);
    }

};



db_fncs.update_user_post_count = async function (data, options) {


    try {


        let d = SqyDB_Cache['cpx_users'][data.postAuthor.authorId];

        console.log(' after post ran  :: ---> ', d);

        if (d && d._id) {

            d.$connections$ = d.$connections$ || {};
            d.$connections$.posts = d.$connections$.posts || 0;

            d.$connections$.posts++;

            SqyDB_Cache['cpx_users'][data.postAuthor.authorId] = d;

            // @@ --- persist straight up
            let options = {
                collection: 'cpx_users'
            };


            // @@ update admin report as well...
            admin_report.posts_count = admin_report.posts_count || 0;

            admin_report.posts_count++

            SqyDB.fncs.reCache_and_persist_updated_doc(SqyDB_Cache['cpx_users'][data.postAuthor.authorId], options);
            d = null;

            // @@ persist connection
            const commPersistWorker = new Worker("./comments_worker.js", {
                smol: true,
            });

            commPersistWorker.postMessage({

                config,
                fnc: 'persist_admin_report',
                // resourceId: options.comment.resourceId,
                // commentId: _id,
                // collection: '$users_followers',
                admin_report: JSON.stringify(admin_report),
                // value: options.value
            });

        }

    } catch (error) {
        console.log(' error :: ---> ', error);
    }

}


SqyDB.db_ops.check_exists = async function (options) {

    let where_key = Object.keys(options.$where)[0];
    let where_val = options.$where[where_key];

    // console.log(' w$$$$$$ --===>', options.$where, where_key, SqyDB_index[options.collection], where_val )

    if (SqyDB_stats[options.collection].collection_index.indexOf(where_key) > -1) {

        // search acros nodes and clusters
        if (where_key == '_id') {

            return { msg: SqyDB_index[options.collection]._id.hasOwnProperty(where_val), _id: SqyDB_index[options.collection]._id[where_val] }
        }

        let res_exists = SqyDB_index[options.collection].others.hasOwnProperty(where_val);
        let _id = SqyDB_index[options.collection].others[where_val];


        // console.log('res_exists :: -->', res_exists, options.$return_data , where_val, _id, SqyDB_Cache[options.collection][res_exists] )

        if (res_exists) {


            if (options.$return_data) {

                return {
                    msg: true,
                    _id: SqyDB_index[options.collection].others[where_val],
                    data: SqyDB_Cache[options.collection][_id]
                }
            }

            return { msg: true, _id: SqyDB_index[options.collection].others[where_val] }
        }

        return { msg: false }

        // if ( SqyDB_index[options.collection].hasOwnProperty(where_val) ) {
        //     return { msg: true }
        // }
        // return { msg: false }

        // @@ search other Nodes & clusters if available 
        // return SqyDB_stats[options.collection].hasOwnProperty(where_key);
    }

    // @@ false or device a means to search across clusters
    return { msg: false }

    // return await _check_exists(options, SqyDB_Cache, SqyDB_index, SqyDB_stats);

};

// var arr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];

SqyDB.db_ops.check_pay_status = async function (options) {

}

// @@ check for unique_id_grant_year_code tooo....
// return all as ibject
// SqyDB.db_ops.check_grant_access_mode_and_pay_status = async function (options) {

// }

// @@ Collections in chronological or reverse chron order
// SqyDB.db_ops.listDocumentsByDate = async function (options) { }

// @@ Collections in chronological or reverse chron order
SqyDB.db_ops.listDocuments = async function (options) {

    // console.log('--====---> getting Posts', options, "SqyDB_index['cpx_posts']['_id']");

    let documents = [];

    // let user_id = options.$where.author;



    let skip = options.$skip;
    let postLimit = options.$limit || 10;
    let endPost = 0;

    let lPost = SqyDB_sort_cache[options.collection].length;

    let $join = options['$join'];
    let run_join = false;
    let found = false;


    if (typeof $join == 'object' && $join &&
        typeof $join.collection !== 'undefined' &&
        config.join_collection_map && typeof $join.id_key !== 'undefined' &&
        SqyDB_Cache[config.join_collection_map[$join.collection]]
    ) {
        run_join = true;
    }


    console.log('$join :: ---->', run_join, options);

    // console.log('--====---> listDocuments for', 'options', SqyDB_sort_cache[options.collection], '\n skip :: ->', skip);


    for (let index = 0; index < lPost; index++) {

        if (endPost == postLimit) {

            break;
        }

        if (found && (!options.$limit || options.$limit <= 1)) { break; }

        if (index >= skip && endPost <= postLimit) {

            let key = SqyDB_sort_cache[options.collection][index];

            // let key = SqyDB_index[options.collection]['_id'][_id];

            // console.log('--====---> listing for', 'options key._id', key._id, ' \n options :: ->', options, SqyDB_index[options.collection]['_id'][key._id] );

            // @@ skip deleted items
            // if ( key._id == '$deleted') { continue; }
            if (!SqyDB_index[options.collection]['_id'][key._id]) { continue; }

            // let post_id = SqyDB_index['cpx_posts']['_id'][key];
            // let post_id = SqyDB_index['cpx_posts']['_id'][key._id];
            let cData = SqyDB_Cache[options.collection][key._id];
            // let isUserPost = options.author_type == 'profile' ?
            // curr_post_data.postAuthor.authorId : curr_post_data.postEntity._id;

            // console.log('post_id ->', post_id);

            // console.log('--====---> getting feed 0', user_id, curr_post_data._id, SqyDB_index['$postLikes']['_id'][curr_post_data._id][user_id]  );
            let data_x = {}
            // if (curr_post_data && isUserPost == user_id) {
            if (cData) {

                // @@ run filters
                let res_ = filter_engine(cData, options);

                // console.log(' \n \n \n res_ 0 ---- >>>', res_ );

                if (res_.status == 'true') {


                    found = true;

                    // let hasLiked = typeof SqyDB_index['$postLikes']['_id'][curr_post_data._id] !== 'undefined' && typeof SqyDB_index['$postLikes']['_id'][curr_post_data._id][user_id] == 'string' ? true : false;
                    // curr_post_data.hasLiked = hasLiked;
                    // let curr_post_data = res_.data;
                    // res_ = null;
                    // if (curr_post_data && curr_post_data.attr && !curr_post_data.attr.is_media_post) {
                    // @@  -- joining from others coll
                    // let join_val = value_from_key_depth($join.id_key, curr_post_data);
                    data_x = res_.data;
                    // console.log(' 000 check ---> $$ :: --->>', 'check_key', options, 'join_val ::', join_val, SqyDB_Cache[config.join_collection_map[$join.collection]][join_val] );
                    let $joiner;
                    // --- check connection
                    if (run_join) {


                        let join_val = value_from_key_depth($join.id_key, res_.data);

                        if (join_val !== "$null") {

                            let useJoinD = {};
                            // let join_keys = Object.keys(options['$join']);
                            let join_data = SqyDB_Cache[config.join_collection_map[$join.collection]][join_val];

                            // console.log('join_data -->', join_data );

                            if (join_data && join_data._id) {

                                // if (join_data._fields) {
                                //     delete join_data._fields.password
                                // }
                                useJoinD = join_data;
                                // if (!options.forReset) {

                                //     delete join_data.$creator$;
                                //     delete join_data.$extras$;
                                //     delete join_data.$last_edited_on$;
                                //     delete join_data.$t$;
                                // }

                                if (!options.forAuth) {

                                    // delete join_data.$uid$;
                                    // delete join_data.role;
                                    let { $creator$, $last_edited_on$, $password$, $last_edited_by$, $t$, role, $uid$, ...dataToUse } = join_data;

                                    useJoinD = dataToUse;


                                    if (useJoinD._fields && useJoinD._fields.password) {
                                        // useJoinD._fields.password = '#ENCRYPTED#';
                                    }
                                }


                                $joiner = useJoinD;

                                // console.log('useJoinD -->', useJoinD );

                            }
                        }

                    }

                    // if (count_posts <= postLimit) {
                    // feed.posts.unshift(curr_post_data);

                    if (!options.forAuth) {

                        let { $creator$, $last_edited_on$, $password$, $last_edited_by$, $t$, role, $uid$, ...dataToUse } = res_.data;
                        data_x = dataToUse;

                        if (data_x._fields && data_x._fields.password) {
                            // data_x._fields.password = '#ENCRYPTED#';
                        }

                    }

                    // console.log('useJoinD -->', useJoinD );

                    if ($joiner) {

                        data_x.$join = $joiner;
                    }


                    // console.log(' $joiner -->', data_x );


                    // feed.posts.push(key._id);
                    // delete curr_post_data.$creator$;
                    // delete curr_post_data.$extras$;
                    // delete curr_post_data.$last_edited_on$;
                    // delete curr_post_data.$t$;
                    // delete curr_post_data.$uid$;
                    // delete curr_post_data.role;



                    // if (data_x._fields && data_x._fields.password) {
                    //     data_x._fields.password = '#ENCRYPTED#';
                    // }

                    documents.push(data_x);
                    // count_posts++;
                    // }
                    // else { }
                    endPost++;
                    // }

                    // curr_post_data = null;
                    data_x = null;

                }

            }
        }


    }

    // console.log('--====---> Store :: ', SqyDB_index['cross_store'] );

    // console.log('--====---> listDocuments for', 'options', SqyDB_sort_cache[options.collection], '\n skip :: ->', skip, documents );

    return { status: 'ok', documents }

};


SqyDB.db_ops.get_feed = async function (options) {

    // console.log('--====---> getting feed', options, "SqyDB_index['cpx_posts']['_id']");

    let feed = { 'posts': [], 'media_center': [], 'user_suggestions': [], 'entity': [], store: [] };

    let user_id = options.$where._id;

    // console.log('--====---> getting feed for', 'options', SqyDB_sort_cache['cpx_posts'] );


    // @@ Add 6 latest posts from back up
    // -- later ignore from this user's seen list

    // @@ add 5 media center items from latest back
    let count_posts = 1, count_media = 1, count_user = 1, count_entity = 1, count_items = 1;

    // for ( const key in SqyDB_index['cpx_posts']['_id'] ) {

    let lPosts = SqyDB_sort_cache['cpx_posts'].length;
    // startPostsFrom = options.$page == 0 ? postLimit : postLimit * options.$page;

    let skip = options.$page || 0, skipMedia = options.$page || 0;
    let postLimit = 12, mediaLimit = 4;
    skip = skip == 0 ? 0 : skip * postLimit;
    skipMedia = skipMedia == 0 ? 0 : skipMedia * mediaLimit;
    let endPost = 0, endMedia = 0;
    // if (i >= skip && end < limit) {

    //     // creators.push(res_.data.__creator_);
    //     documents.push(res_.data);
    //     end++;

    // }
    // let end = parseInt(limit) + parseInt(skip);
    // console.log(' SqyDB_sort_cache_ost :: --->', SqyDB_sort_cache['cpx_posts'] );
    let cost_ner = [];


    for (let index = 0; index < lPosts; index++) {

        if (endMedia >= skipMedia && endMedia <= mediaLimit) {

            let key = SqyDB_sort_cache['cpx_posts'][index];

            // console.log('--====---> getting feed for', 'options key._id', key._id );

            // let post_id = SqyDB_index['cpx_posts']['_id'][key];
            let post_id = SqyDB_index['cpx_posts']['_id'][key._id];
            let curr_post_data = SqyDB_Cache['cpx_posts'][post_id];

            // console.log('post_id ->', post_id);
            // console.log('--====---> getting feed 0', user_id, curr_post_data._id, SqyDB_index['$postLikes']['_id'][curr_post_data._id][user_id]  );

            let hasLiked = typeof connectionIndex['$post_likes'][curr_post_data._id] !== 'undefined' && typeof connectionIndex['$post_likes'][curr_post_data._id][user_id] == 'string' ? true : false;
            // curr_post_data.hasLiked = hasLiked;

            if (curr_post_data && curr_post_data.attr && curr_post_data.attr.is_media_post) {

                //     if (count_media <= 4) {
                //         feed.media_center.unshift(curr_post_data);
                // feed.media_center.unshift(curr_post_data);
                feed.media_center.unshift({ ...curr_post_data, hasLiked });
                cost_ner.unshift(key._id);
                //         count_media++;
                //     }
                endMedia++;

            }



        }

        if (index >= skip && endPost < postLimit) {

            let key = SqyDB_sort_cache['cpx_posts'][index];

            // console.log('--====---> getting feed for', 'options key._id', key._id );

            // let post_id = SqyDB_index['cpx_posts']['_id'][key];
            let post_id = SqyDB_index['cpx_posts']['_id'][key._id];
            let curr_post_data = SqyDB_Cache['cpx_posts'][post_id];

            // console.log('post_id ->', post_id);
            // console.log('--====---> getting feed 0', user_id, curr_post_data._id, SqyDB_index['$postLikes']['_id'][curr_post_data._id][user_id]  );

            let hasLiked = typeof connectionIndex['$post_likes'][curr_post_data._id] !== 'undefined' && typeof connectionIndex['$post_likes'][curr_post_data._id][user_id] == 'string' ? true : false;
            // curr_post_data.hasLiked = hasLiked;

            if (curr_post_data && curr_post_data.attr && !curr_post_data.attr.is_media_post) {

                // if (count_posts <= postLimit) {
                // feed.posts.unshift(curr_post_data);
                // feed.posts.push(key._id);
                feed.posts.push({ ...curr_post_data, hasLiked });
                // count_posts++;
                // }
                // else { }
                endPost++;
            }

            // if (curr_post_data && curr_post_data.attr && curr_post_data.attr.is_media_post) {

            //     if (count_media <= 4) {
            //         feed.media_center.unshift(curr_post_data);
            //         count_media++;
            //     }

            // }

            hasLiked = null; post_id = null; curr_post_data = null;
        }
    }


    console.log('lolo skip --->', 'feed.skipMedia ', skip, skipMedia, cost_ner);

    // for (const key in SqyDB_index['cpx_entity']['_id']) {


    let lEnt = SqyDB_sort_cache['cpx_entity'].length;

    let entLimit = 4;
    let skipEnt = options.$page || 0;
    skipEnt = skipEnt == 0 ? 0 : skipEnt * entLimit;
    let endEnt = 0;

    for (let index = 0; index < lEnt; index++) {

        if (index >= skipEnt && endEnt <= entLimit) {

            let key = SqyDB_sort_cache['cpx_entity'][index];

            // console.log('--====---> getting feed for', 'options key._id', key._id );

            // let post_id = SqyDB_index['cpx_posts']['_id'][key];
            let entity_id = SqyDB_index['cpx_entity']['_id'][key._id];
            let curr_entity_data = SqyDB_Cache['cpx_entity'][entity_id];

            // console.log('cpx_entity ->', SqyDB_index['cpx_entity']['_id'] );
            // console.log('--====---> getting feed 0', user_id, curr_post_data._id, SqyDB_index['$postLikes']['_id'][curr_post_data._id][user_id]  );

            // let hasFollowed = typeof SqyDB_index['$followers']['_id'][curr_entity_data._id] !== 'undefined' && typeof SqyDB_index['$followers']['_id'][curr_entity_data._id][user_id] == 'string' ? true : false;
            // curr_entity_data.hasFollowed = hasFollowed;
            let hasFollowed = typeof connectionIndex['$entity_linkup'][curr_entity_data._id] !== 'undefined' && typeof connectionIndex['$entity_linkup'][curr_entity_data._id][user_id] == 'string' ? true : false;

            // let isMember = typeof SqyDB_index['$groupMembers']['_id'][curr_entity_data._id] !== 'undefined' && typeof SqyDB_index['$groupMembers']['_id'][curr_entity_data._id][user_id] == 'string' ? true : false;
            // curr_entity_data.isMember = isMember;

            // let isMember = typeof connectionIndex['$group_members'][curr_entity_data._id] !== 'undefined' && typeof connectionIndex['$group_members'][curr_entity_data._id][user_id] == 'string' ? true : false;
            let isMember = false;

            if (hasFollowed) {
                isMember = curr_entity_data._fields.entity_type == 'Group' ? true : false;
            }

            if (curr_entity_data) {

                // if (count_entity <= 6) {

                // let d = { hasFollowed, isMember };
                // d._id = curr_entity_data._id;
                // d.entity_type = curr_entity_data.entity_type;
                // d.$connections$ = curr_entity_data.$connections$;
                const { $connections$, _id, _fields } = curr_entity_data;
                // d.hasFollowed = curr_entity_data.hasFollowed;
                // d.isMember = curr_entity_data.isMember;
                // d._fields = curr_entity_data._fields;
                // { $t$, $last_edited_on$, $extras$, $creator$, $managers, ...curr_entity_data}

                // let { $t$, $last_edited_on$, $extras$, $creator$, $managers, ...curr_entity_data} = d;
                feed.entity.unshift({ _id, hasFollowed, isMember, $connections$, _fields });
                // count_entity++;
                // }
                // else { }
            }

            hasFollowed = null; entity_id = null; curr_entity_data = null;
            isMember = null;
        }
    }


    // @@ add 4 shuffled users from latest back -- ignore this user ID
    // -- later ignore from this user's follow list
    // for (const key in SqyDB_index['cpx_users']['_id']) {
    let lProf = SqyDB_sort_cache['cpx_users'].length;

    let profLimit = 4;
    let skipProf = options.$page || 0;
    skipProf = skipProf == 0 ? 0 : skipProf * profLimit;
    let endProf = 0;

    for (let index = 0; index < lProf; index++) {

        if (index >= skipProf && endProf <= profLimit) {

            let key = SqyDB_sort_cache['cpx_users'][index];

            let profile_id = SqyDB_index['cpx_users']['_id'][key._id];
            let curr_profile_data = SqyDB_Cache['cpx_users'][profile_id];

            const { $connections$, _id } = curr_profile_data;

            const { fullname, displayPhoto, username, firstname } = curr_profile_data._fields;

            // console.log('--====---> Profiles :: ', fullname, SqyDB_index );
            // let isFollowing = typeof SqyDB_index['$followings']['_id'][user_id] !== 'undefined' && typeof SqyDB_index['$followings']['_id'][user_id][_id] !== 'undefined' ? true : false;
            let isFollowing = typeof connectionIndex['$users_followers'][curr_profile_data._id] !== 'undefined' && typeof connectionIndex['$users_followers'][curr_profile_data._id][user_id] == 'string' ? true : false;

            // if (count_user <= 4) {

            if (_id !== user_id) {

                // console.log('--====---> 0 Sorting feed for :: ', firstname, _id !== user_id);

                feed.user_suggestions.unshift({
                    _id, firstname,
                    fullname, displayPhoto, username, $connections$,
                    isFollowing
                })

                // count_user++;
                endProf++;
            }

            // break;

        }


    }

    // console.log('--====---> Store :: ', SqyDB_index['cross_store'] );

    // @@ add 4 Store items
    // -- later ignore from this user's follow list
    for (const key in SqyDB_index['cross_store']['_id']) {

        let item_id = SqyDB_index['cross_store']['_id'][key];
        let curr_item_data = SqyDB_Cache['cross_store'][item_id];

        const { _fields, _id } = curr_item_data;

        // console.log('--====---> Store :: ', SqyDB_index['cross_store']['_id'] );
        // let isFollowing = typeof SqyDB_index['$followings']['_id'][user_id] !== 'undefined' && typeof SqyDB_index['$followings']['_id'][user_id][_id] !== 'undefined' ? true : false;

        if (count_items <= 4) {

            if (_id !== user_id) {

                // console.log('--====---> 0 Sorting feed for :: ', firstname, _id !== user_id);

                feed.store.unshift({
                    _id, _fields,
                })

                count_items++;
            }

            // break;

        }


    }


    return { status: 'ok', feed }

};



SqyDB.db_ops.get_discover_feed = async function (options) {

    // console.log('--====---> getting discover_feed', options, "SqyDB_index['cpx_posts']['_id']");

    let discover_feed = [];

    let user_id = options.$where._id;

    // console.log('--====---> getting feed for', 'options', SqyDB_sort_cache['cpx_posts'] );


    // @@ Add 6 latest posts from back up
    // -- later ignore from this user's seen list

    // @@ add 5 media center items from latest back
    let count_profile = 1, count_entity = 1;

    // for ( const key in SqyDB_index['cpx_posts']['_id'] ) {

    // let lPosts = SqyDB_sort_cache['cpx_posts'].length;
    // startPostsFrom = options.$page == 0 ? postLimit : postLimit * options.$page;

    let skip = options.$page || 0, skipMedia = options.$page || 0;
    let postLimit = 12, mediaLimit = 4;
    skip = skip == 0 ? 0 : skip * postLimit;
    skipMedia = skipMedia == 0 ? 0 : skipMedia * mediaLimit;
    // if (i >= skip && end < limit) {

    //     // creators.push(res_.data.__creator_);
    //     documents.push(res_.data);
    //     end++;

    // }
    // let end = parseInt(limit) + parseInt(skip);
    // console.log(' SqyDB_sort_cache_ost :: --->', SqyDB_sort_cache['cpx_posts'] );


    let lEnt = SqyDB_sort_cache['cpx_entity'].length;

    let entLimit = 2;
    let skipEnt = options.$page || 0;
    skipEnt = skipEnt == 0 ? 0 : skipEnt * entLimit;
    let endEnt = 0;

    for (let index = 0; index < lEnt; index++) {

        if (index >= skipEnt && endEnt <= entLimit) {

            let key = SqyDB_sort_cache['cpx_entity'][index];

            // console.log('--====---> getting feed for', 'options key._id', key._id );

            // let post_id = SqyDB_index['cpx_posts']['_id'][key];
            let entity_id = SqyDB_index['cpx_entity']['_id'][key._id];
            let curr_entity_data = SqyDB_Cache['cpx_entity'][entity_id];

            // console.log('cpx_entity ->', SqyDB_index['cpx_entity']['_id'] );
            // console.log('--====---> getting feed 0', user_id, curr_post_data._id, SqyDB_index['$postLikes']['_id'][curr_post_data._id][user_id]  );

            let hasFollowed = typeof SqyDB_index['$followers']['_id'][curr_entity_data._id] !== 'undefined' && typeof SqyDB_index['$followers']['_id'][curr_entity_data._id][user_id] == 'string' ? true : false;
            curr_entity_data.hasFollowed = hasFollowed;

            let isMember = typeof SqyDB_index['$groupMembers']['_id'][curr_entity_data._id] !== 'undefined' && typeof SqyDB_index['$groupMembers']['_id'][curr_entity_data._id][user_id] == 'string' ? true : false;
            curr_entity_data.isMember = isMember;

            if (curr_entity_data) {

                // if (count_entity <= 2) {

                let d = {};
                d._id = curr_entity_data._id;
                d.entity_type = curr_entity_data.entity_type;
                d.$connections$ = curr_entity_data.$connections$;
                d.hasFollowed = curr_entity_data.hasFollowed;
                d.isMember = curr_entity_data.isMember;
                d._fields = curr_entity_data._fields;
                // { $t$, $last_edited_on$, $extras$, $creator$, $managers, ...curr_entity_data}

                // let { $t$, $last_edited_on$, $extras$, $creator$, $managers, ...curr_entity_data} = d;
                discover_feed.unshift(d);

                endEnt++;
                // }
                // else { }
            }

            hasFollowed = null; entity_id = null; curr_entity_data = null;

        }
    }


    // @@ add 4 shuffled users from latest back -- ignore this user ID
    // -- later ignore from this user's follow list
    // for (const key in SqyDB_index['cpx_users']['_id']) {
    let lProf = SqyDB_sort_cache['cpx_users'].length;

    let profLimit = 4;
    let skipProf = options.$page || 0;
    skipProf = skipProf == 0 ? 0 : skipProf * profLimit;
    let endProf = 0;

    for (let index = 0; index < lProf; index++) {

        if (index >= skipProf && endProf <= profLimit) {

            let key = SqyDB_sort_cache['cpx_users'][index];

            let profile_id = SqyDB_index['cpx_users']['_id'][key._id];
            let curr_profile_data = SqyDB_Cache['cpx_users'][profile_id];

            const { fullname, displayPhoto, _username, $connections$, _id, firstname } = curr_profile_data;

            // console.log('--====---> Profiles :: ', fullname, SqyDB_index );
            let isFollowing = typeof SqyDB_index['$followings']['_id'][user_id] !== 'undefined' && typeof SqyDB_index['$followings']['_id'][user_id][_id] !== 'undefined' ? true : false;

            // if (count_user <= 4) {

            if (_id !== user_id) {

                // console.log('--====---> 0 Sorting feed for :: ', firstname, _id !== user_id);

                discover_feed.unshift({
                    _id, firstname,
                    fullname, displayPhoto, _username, $connections$,
                    isFollowing
                })

                // count_user++;
                endProf++;
            }

            // break;

        }


    }

    // console.log('--====---> Store :: ', SqyDB_index['cross_store'] );


    return { status: 'ok', discover_feed }

};



const get_one_by_id = async function (_id, options) {

    /* 
    * @@ 1. Get the doc with the supplied _id or all if no _id is supplied 
    **/
    // let dataPool = SqyDB_cache[options.config][options.collection]; 


    // console.log('12 _get Get By ID ------------------->>>', options.collection, '---', SqyDB_Cache[options.collection], '----', _id,  SqyDB_Cache[options.collection][_id] )

    // * @@ 1. Get by ID from Cache 
    let doc1 = SqyDB_Cache[options.collection][_id];
    let check_connection_result = {};

    // console.log('found \n --- :: >', doc1 );



    let $join = options['$join'];
    let run_join = false;

    // console.log('--====---> listDocuments for', 'options', SqyDB_sort_cache[options.collection], '\n skip :: ->', skip );
    if (typeof $join == 'object' && $join &&
        typeof $join.collection !== 'undefined' &&
        config.join_collection_map && typeof $join.id_key !== 'undefined' &&
        SqyDB_Cache[config.join_collection_map[$join.collection]]
    ) {
        run_join = true;
    }

    let data_x = {}

    if (doc1 && doc1._id) {

        // let fDoc = { ...doc1 };
        data_x = doc1;
        // console.log(' 493 000 check ---> $$ :: --->>', 'check_key', options, 'SqyDB_index', !options.forReset, !options.forAuth, '\n :: doc1------>', doc1 );

        // if ( !options.forReset ) {

        //     delete fDoc.$extras$;
        //     delete fDoc.$last_edited_on$;
        // }

        if (!options.forAuth) {

            // delete fDoc.$creator$;
            // delete fDoc.$t$;
            // delete fDoc.$uid$;
            // delete fDoc.role;
            let { $creator$, $last_edited_on$, $password$, $last_edited_by$, $t$, role, $uid$, ...dataToUse } = doc1;
            data_x = dataToUse;

        }

        // let join_val = value_from_key_depth($join.id_key, res_.data);

        // console.log(' 000 check ---> $$ :: --->>', 'check_key', options, 'join_val ::', join_val);

        // console.log(' \n \n \n 513 000 Doc1 :: --->>', ' \n \n fDoc ->', fDoc );

        // return { msg: 'nullo' }


        // --- check connection

        // console.log(' 000 check ---> $$ :: --->>', 'check_key', options, 'join_val ::', join_val, SqyDB_Cache[config.join_collection_map[$join.collection]][join_val] );

        // --- check connection
        if (run_join) {

            let join_val = value_from_key_depth($join.id_key, doc1);

            if (join_val !== "$null") {

                let data_y = {};

                // let join_keys = Object.keys(options['$join']);
                let join_data = SqyDB_Cache[config.join_collection_map[$join.collection]][join_val];


                if (join_data && join_data._id) {

                    // if (join_data._fields) {
                    //     delete join_data._fields.password
                    // }

                    // let fjoin_data = { ...join_data };

                    // if (!options.forReset) {

                    //     delete fjoin_data.$extras$;
                    //     delete fjoin_data.$last_edited_on$;
                    // }

                    if (!options.forAuth) {

                        // delete fjoin_data.$creator$;
                        // delete fjoin_data.$uid$;
                        // delete fjoin_data.role;
                        // delete fjoin_data.$t$;
                        let { $creator$, $last_edited_on$, $last_edited_by$, $t$, role, $uid$, ...dataToUse } = join_data;
                        data_y = dataToUse;
                    }

                    data_x.$join = data_y;

                }
            }

        }

        // console.log(' \n \n 561 after sign in ', options, SqyDB_Cache['cpx_users']['11997V1VQ2K0f2s6P7K420S0I4Vh1V1']  );

        return { msg: 'OK', doc: data_x, check_connection_result }
    }

    // @@ else check across the cluster
    // -- smart checking via _id analyzing
    // -- return null for now
    return { msg: 'NULL' }



}


const get_docs_by_query = async function (options) {

    /* 
    * @@ 1. Get the doc with the supplied _id or all if no _id is supplied 
    **/
    // let dataPool = SqyDB_cache[options.config][options.collection]; 
    // console.log(' 000 check ---> $$ :: --->>', 'check_key', options, 'SqyDB_index');

    // * @@ 1. Get by $query
    let documents = [];
    let startTime = Date.now(), found = false;

    let skip = options.$skip || 0;
    let limit = options.$limit || 10;
    // let end = parseInt(limit) + parseInt(skip);
    let end = 0;
    let i = 0;
    let res_;

    let $join = options.$join;
    let run_join = false;

    if (typeof $join == 'object' && $join &&
        typeof $join.collection !== 'undefined' &&
        config.join_collection_map && typeof $join.id_key !== 'undefined' &&
        SqyDB_Cache[config.join_collection_map[$join.collection]]
    ) {
        run_join = true;
    }

    // console.log(' 00 Get ---> ::', options );

    // console.log(' 010 - fetching Applications :: -->', $join, run_join, $join, 'id_key');

    // console.log(' 536 get_docs_by_query -->', options, SqyDB_index[options.collection]);

    for (const id_key in SqyDB_index[options.collection]['_id']) {


        // console.log('id_key -->', id_key, SqyDB_Cache[options.collection][id_key].post_id );

        if (found && (!options.$limit || options.$limit <= 1)) { break; }

        let useD = {};

        res_ = filter_engine(SqyDB_Cache[options.collection][id_key], options);

        if (res_.status == 'true') {

            // const realData = res_.data;
            useD = res_.data;

            found = true;

            // break when we find on if the option was passed
            // if (options.get_just_one) {
            // console.log('1134 get just one got -- from many?', options.find_one_from_many );
            // }



            if (!options.forAuth) {

                // delete realData.$uid$;
                // delete realData.role;

                let { $creator$, $extras$, $last_edited_on$, $last_edited_by$, $t$, role, $uid$, ...dataToUse } = res_.data;

                useD = dataToUse;
            }


            // if (res_.data._fields) {
            //     delete res_.data._fields.password
            // }

            // run_join
            // console.log(' 2220 - fetching Applications :: -->', $join.id_key, res_.data[$join.id_key] );

            // break;
            // @@  -- joining from others coll


            // console.log(' 000 check ---> $$ :: --->>', 'check_key', options, 'join_val ::', join_val, SqyDB_Cache[config.join_collection_map[$join.collection]][join_val] );

            // --- check connection
            if (run_join) {

                let join_val = value_from_key_depth($join.id_key, res_.data);

                if (join_val !== "$null") {

                    let useJoinD = {};
                    // let join_keys = Object.keys(options['$join']);
                    let join_data = SqyDB_Cache[config.join_collection_map[$join.collection]][join_val];



                    if (join_data && join_data._id) {

                        useJoinD = join_data;

                        // if (join_data._fields) {
                        //     delete join_data._fields.password
                        // }


                        // if (!options.forReset) {
                        //     delete join_data.$creator$;
                        //     delete join_data.$extras$;
                        //     delete join_data.$last_edited_on$;
                        //     delete join_data.$t$;

                        // }


                        if (!options.forAuth) {

                            // delete join_data.$uid$;
                            // delete join_data.role;
                            let { $creator$, $extras$, $last_edited_on$, $last_edited_by$, $t$, role, $uid$, ...dataToUse } = join_data;

                            useJoinD = dataToUse;
                        }

                        useD.$join = useJoinD;

                    }
                }

            }

            i++;


            // SqyDB_Cache[options.collection][id_key] = realData;

            if (i >= skip && end < limit) {

                // creators.push(res_.data.__creator_);
                console.log('end -->', end, useD);
                documents.push(useD);
                end++;

            }

        }


    }

    //    console.log( ' SqY DB --====> GET by $query --->', options, '\n\n --------->>>> Cache', 'SqyDB_Cache[options.collection]', '\n\n --------->>>> Index', SqyDB_index, '\n\n --------->>>> Stats', SqyDB_stats[options.collection] );
    // console.log('Get ---> ::', options, documents  );
    // console.log(' GET by $query documents ---> ',
    // documents, '\n', 'options.$query', options, '\n ----- in ', 'SqyDB_Cache[options.collection]', (Date.now() - startTime) / 1000);
    // __creator_: creator_final, creators
    return { documents, count: i, limit, skipped: skip }
    // @@ else check across the cluster


};


// setInterval(function() {

//     console.log(' \n \n 561 after sign in ', SqyDB_Cache['cpx_users']['11997V1VQ2K0f2s6P7K420S0I4Vh1V1']  );

// },3400);

SqyDB.db_ops.get = async function (options) {

    // let file = Bun.file('/Applications/MAMP/htdocs/SqyDB_deploy/../_d_data/cpUser/002/0008h1j6n8w5a5o70011987.json');
    // const doc = await file.json();


    if (options.db_fn && typeof SqyDB.db_ops[options.db_fn] == 'function') {

        return await SqyDB.db_ops[options.db_fn](options);
    }


    /* 
   * @@ 1. Get the doc with the supplied _id or all if no _id is supplied 
   **/
    // let dataPool = SqyDB_cache[options.config][options.collection]; 

    // console.log('getet 90 ===::m===:: -----<<>>>>>', options, SqyDB_index['cpFeeds'], !options.$where && !options.$where_not && !options.$search  );

    if (!options.$where && !options.$where_not && !options.$search) {

        // return { msg: 'Bad Options' }

        // @@ proceed to $query filters 


        return await get_docs_by_query(options);
    }

    // console.log('get ing cpFeedo ===::m===:: -----<<>>>>>', options, SqyDB_index['cpFeeds'], !options.$where && !options.$where_not && !options.$search  );

    // * @@ 1. Get the _id 
    let _id = options._id || (options.$where && options.$where._id);

    // let _id = options.$where._id; //._id ? options._id : (options.$where && options.$where._id || 'null');

    // console.log('get ing cpFeedo ===::m===:: -----<<>>>>>', options, '_id _id ---:: -->', _id._id );

    if (typeof _id == 'string') {

        return await get_one_by_id(_id, options);
    }

    // @@ proceed to $query filters 
    // console.log(' 00 - fetching Applications :: -->', options.$join);

    // console.log('Goatie ran');

    return await get_docs_by_query(options);


    // return await _get(options, SqyDB_Cache, SqyDB_index, SqyDB_stats);

};

SqyDB.fncs.run_update_on_data = async function (_doc, update_data) {

    let $update_sub_resource = update_data['$update_sub_resource'];

    if ($update_sub_resource) {

        delete update_data['$update_sub_resource']

    }

    let data_to_update_keys = Object.keys(update_data);

    // @@ update the supplied data keys on the doc 
    data_to_update_keys.forEach(async (k) => {

        // @@ arrays
        if (typeof update_data[k] == 'object' && typeof update_data[k].length == 'number') {

            // @@ -- 
            // console.log(' --->', update_data[k]);
            let has_ = update_data[k].indexOf('__push') > -1 || update_data[k].indexOf('__remove') > -1;

            // @@ has helper
            if (has_) {

                // console.log( 'kkkk  --->', k, _u.data_v_to_check_with(k, _doc), _doc[k] );

                if (typeof _u.data_v_to_check_with(k, _doc) == 'object'
                    && typeof _u.data_v_to_check_with(k, _doc).length == 'number') {

                    // console.log(' 0 --->', update_data[k] );
                    // @@ ops -- 0 -- 0 - 0 - ;

                    // -- push into arrays
                    if (update_data[k][0] == '__push') {

                        let _aa = k.split('.');
                        let _md = _aa.length > 1 ? _doc[_aa[0]][_aa[1]] : _doc[k];

                        update_data[k].forEach((item, i) => {
                            i > 0 && _md.indexOf(item) == -1 && _md.push(item);
                        });

                        // console.log('_md -->', _md);


                        _doc[k] = _md;

                    }

                    // -- delete a particular item from the array
                    if (update_data[k][0] == '__remove') {

                        // console.log('ex_d ai -->', ai);

                        let ex_d = _u.data_v_to_check_with(k, _doc), na_count = 0, _na = [];

                        // console.log( '_na 0 -->', _na, ex_d, update_data[k], ex_d.filter( e => { e !== '_'}) );

                        // @@ copy existing array data without the items to remove
                        ex_d.forEach(ai => {

                            // console.log('ex_d ai -->', ai, _na.indexOf(ai) == -1);
                            // @@ if ai is not in remove list
                            if (update_data[k].indexOf(ai) == -1 && _na.indexOf(ai) == -1) { _na.push(ai); na_count++; }

                        });


                        // if (true) {}
                        _u.which_doc_key_to_set(k, _doc, _na);


                    }

                }
            }

            // @@ no helper fn	
            else {
                // _doc[k] = update_data[k]; 
                _u.which_doc_key_to_set(k, _doc, update_data);
            }


        }

        // @@ non array data
        else {

            // console.log('now updating ---->', k, '\n\n ---===> data ------->><>>>', update_data[k])
            // _doc[k] = update_data[k]; 
            _u.which_doc_key_to_set(k, _doc, update_data);

            // console.log('Now updated with :: --->', update_data , '\n $update_sub_resource ---->', $update_sub_resource);

            if ($update_sub_resource) {
                await SqyDB.fncs.update_sub_resource($update_sub_resource)
            }
        }

    });

    // @@ or add 
    // if (update_data.$add) {

    //     let k = Object.keys(update_data.$add)[0];
    //     let v = update_data.$add[k];

    //     // console.log('adding --====>', k, v);

    //     // _doc[k] += v;
    //     _u.which_doc_key_to_set(k, _doc, v, '$add');

    //     if ($update_sub_resource) {
    //         await SqyDB.fncs.update_sub_resource($update_sub_resource)
    //     }

    // }



    return _doc

}

// @@ re-cache

SqyDB.fncs.reCache_and_persist_updated_doc = async function (updatedDoc, options) {


    // let _id = SqyDB_stats[options.collection].last_num + 'V' + SqyDB_stats[options.collection].last_node_dir + 'V' + _u.gen_id() + 'V' + config.dbn_prefix + 'V' + SqyDB.db_node;
    // num in folder / last node dir / id / db host / db_node
    // console.log('Persist time --->', updatedDoc );

    // @@ analyze updatedDoc._id to know where to Cache data
    let _id_array = updatedDoc._id.split('V');

    // console.log('_id_array --->>>>', _id_array, config.dbn_prefix);

    // @@ if this data should be operated on by this node 
    // @@ -- also check if the collection for this category was cached later 
    if (_id_array[4] == SqyDB.db_node) {

        SqyDB_Cache[options.collection][updatedDoc._id] = updatedDoc;

        let path_plus_item_id = config.db_data_dir + '/' + options.collection + '/' + _id_array[1].padStart(6, "0") + '/' + updatedDoc._id;

        SqyDB.fncs.queue_cache_persist({
            type: 'write',
            path_plus_item_id,
            data: updatedDoc
        })
        // return ''

    }
    else {

        // @@ make a request to the appropriaet node for a cache update

    }

};

SqyDB.fncs.persist_sub_resource = async function (options) {

    if (options.ops == "$addTo") { }

}


// @@ e.g followers
SqyDB.fncs.update_sub_resource_ = async function (options) {

    if (options.ops == "$addTo") {

        SqyDB_index[options.collection]._id[options.key] = SqyDB_index[options.collection]._id[options.key] || {};
        SqyDB_index[options.collection]._id[options.key][options.indexKey] = '';

        // options_.data = JSON.stringify(options_.data);
        let existingDataPath = config.db_data_dir + '/' + options.collection + '/' + options.$where._id + '/' + updatedDoc._id;

        // SqyDB_Worker_Queue[`${options_.data._id}_set_${Date.now()}`] = options_;
        await Bun.write(options_.path_plus_item_id + '.json', options_.data);

    }

    if (options.ops == "$removeFrom") {

        SqyDB_index[options.collection]._id[options.key] = SqyDB_index[options.collection]._id[options.key] || {};
        delete SqyDB_index[options.collection]._id[options.key][options.indexKey];

    }

    await SqyDB.fncs.persist_sub_resource(options);

}

const connection_ops = {};

connection_ops.unlike_post = async function (options) {

    // @@ subject is Post to unlike
    // @@ actorId is the acting user
    console.log( ' $postsUserLiked :: -> ', SqyDB_index.$postsUserLiked, SqyDB_index.$postLikes)

};



// @@ final DB action to set , unset cinnection
SqyDB.db_ops.set_unset_connections = async function (options) {

    // console.log('set_unset_connections hit :: --->', options );

    if (typeof SqyDB.db_ops[options.connection_type] == 'function') {

        return await SqyDB.db_ops[options.connection_type](options);
    }

    return { error: 'Invalid Conn Ops' }
};



// Cache the first 10 comments for this resource...
// -- send a worker to queue the next 100 afterwards
SqyDB.db_ops.add_comment = async function (options) {

    try {

        // let userToFollowDoc = SqyDB_Cache['cpx_users'][options.subjectId]; // @@ -- //

        console.log(' add_comment -->', options);


        if (!options || !options.comment || !options.comment.resourceId) { return { msg: '400' } }

        let resourceDoc = SqyDB_Cache[options.parent_resource_collection][options.comment.resourceId]; // @@ -- //

        if (!resourceDoc) { return { msg: 'Resource 404' } }

        // commentsIndex[options.comment.resourceId] = commentsIndex[options.comment.resourceId] || {};

        // commentsCache[options.comment.resourceId] = commentsCache[options.comment.resourceId] || {};

        // console.log('commentsIndex -->', commentsIndex,  resourceDoc );

        // @@ generate and id for this resource --- // --- 00 --- //
        // -- Yostorio -- //
        resourceDoc.$connections$.comments_count = resourceDoc.$connections$.comments_count || 0;

        resourceDoc.$connections$.comments_count++;

        let _id = '';

        function check_id() {

            // let _id = dbn_prefix + _u.preceeder_(last_num, 4) + _u.gen_id() + _last_node_dir;
            // if () {}
            // Num in folder / node folder / id / host id = dbn_prefix /  node on host
            let _id = (config.db_node_limit - resourceDoc.$connections$.comments_count) + 'V' + '1' + 'V' + _u.gen_id() + 'V' + config.dbn_prefix + 'V' + SqyDB.db_node;

            // if (commentsIndex[options.comment.resourceId][_id]) {

            //     _id = check_id(_id)
            // }

            // else {
            //     return _id;
            // }

            return _id;

        };

        _id = check_id();

        // @@ set data id
        options.comment._id = _id;

        // kokb

        // @@ controller sorts each results of 10s by 
        options.comment['$t$'] = Date.now();

        // commentsIndex[options.comment.resourceId][_id] = 'options.comment';

        commentsCache[options.comment.resourceId] = commentsCache[options.comment.resourceId] || {}
        commentsCache[options.comment.resourceId][_id] = options.comment;

        resourceDoc.$comments = resourceDoc.$comments || [];


        resourceDoc.$comments.unshift(options.comment);

        if (resourceDoc.$comments.length > 3) { resourceDoc.$comments.pop(); }



        // console.log( ' add_comment :: ->', options  );
        // let current_count = (parseInt(resourceDoc.$connections$.comments_count / 20) + 1) * 20;

        // let file_name = current_count;


        // @@ persist main resource
        SqyDB.fncs.reCache_and_persist_updated_doc(resourceDoc, { collection: 'cpx_posts' });

        // @@ persist connection
        const commPersistWorker = new Worker("./comments_worker.js", {
            smol: true,
        });

        commPersistWorker.postMessage({

            config,
            fnc: 'persist_comment',
            resourceId: options.comment.resourceId,
            commentId: _id,
            // collection: '$users_followers',
            comment: JSON.stringify(options.comment),
            // value: options.value
        });

        return { msg: 'OK' }


        // SqyDB.fncs.reCache_and_persist_updated_doc(actingUserDoc, { collection: 'cpx_users' });



        // console.log('$post_likes :: ->', connectionIndex['$post_likes'], ' \n \n options.value -->', options.value);

        // return { msg: 'OK' }



    } catch (error) {

        console.log('Like Post Err ->', error);
        return { msg: 'Error' }
    }

};


// koko
SqyDB.db_ops.follow_user = async function (options) {

    try {

        let userToFollowDoc = SqyDB_Cache['cpx_users'][options.subjectId]; // @@ -- //

        let actingUserDoc = SqyDB_Cache['cpx_users'][options.actorId]; // @@ -- //

        if (!actingUserDoc || !userToFollowDoc) { return { msg: '404' } }

        connectionIndex['$users_followers'][options.subjectId] = connectionIndex['$users_followers'][options.subjectId] || {};
        connectionIndex['$users_followings'][options.actorId] = connectionIndex['$users_followings'][options.actorId] || {};

        console.log(' follower_user :: ->', options);

        if (connectionIndex['$users_followers'][options.subjectId].hasOwnProperty(options.actorId)) {
            return { msg: '400' }
        }

        userToFollowDoc.$connections$ = userToFollowDoc.$connections$ || {};
        userToFollowDoc.$connections$.followers_count = userToFollowDoc.$connections$.followers_count || 0;
        userToFollowDoc.$connections$.followers_count++;

        actingUserDoc.$connections$ = actingUserDoc.$connections$ || {};
        actingUserDoc.$connections$.following_count = actingUserDoc.$connections$.following_count || 0;
        actingUserDoc.$connections$.following_count++;

        let current_count = (parseInt(userToFollowDoc.$connections$.followers_count / 100) + 1) * 100;

        let current_following_count = (parseInt(actingUserDoc.$connections$.following_count / 100) + 1) * 100;

        let file_name = current_count;
        let following_file_name = current_following_count;

        connectionIndex['$users_followers'][options.subjectId][options.actorId] = "" + file_name;
        connectionIndex['$users_followings'][options.actorId][options.subjectId] = "" + following_file_name;

        // @@ persist main resource
        SqyDB.fncs.reCache_and_persist_updated_doc(userToFollowDoc, { collection: 'cpx_users' });
        SqyDB.fncs.reCache_and_persist_updated_doc(actingUserDoc, { collection: 'cpx_users' });

        // @@ persist connection
        const persistWorker = new Worker("./connections_worker.js", {
            smol: true,
        });

        persistWorker.postMessage({

            config,
            fnc: 'persist_connection_value',
            id: options.subjectId,
            collection: '$users_followers',
            file_name,
            value: options.value
        });

        persistWorker.postMessage({

            config,
            fnc: 'persist_connection_value',
            id: options.actorId,
            collection: '$users_followings',
            file_name: following_file_name,
            value: options.value2
        });

        return { msg: 'OK' }


        // console.log('$post_likes :: ->', connectionIndex['$post_likes'], ' \n \n options.value -->', options.value);

        // return { msg: 'OK' }



    } catch (error) {

        console.log('Like Post Err ->', error);
        return { msg: 'Error' }
    }

};



SqyDB.db_ops.unfollow_user = async function (options) {

    try {

        let userToFollowDoc = SqyDB_Cache['cpx_users'][options.subjectId]; // @@ -- //

        let actingUserDoc = SqyDB_Cache['cpx_users'][options.actorId]; // @@ -- //

        if (!actingUserDoc || !userToFollowDoc) { return { msg: '404' } }

        connectionIndex['$users_followers'][options.subjectId] = connectionIndex['$users_followers'][options.subjectId] || {};
        connectionIndex['$users_followings'][options.actorId] = connectionIndex['$users_followings'][options.actorId] || {};

        console.log(' un follower_user :: ->', options);

        // if (connectionIndex['$users_followers'][options.subjectId].hasOwnProperty(options.actorId)) {
        //     return { msg: '400' }
        // }

        userToFollowDoc.$connections$ = userToFollowDoc.$connections$ || {};
        userToFollowDoc.$connections$.followers_count = userToFollowDoc.$connections$.followers_count || 1;
        userToFollowDoc.$connections$.followers_count--;

        actingUserDoc.$connections$ = actingUserDoc.$connections$ || {};
        actingUserDoc.$connections$.following_count = actingUserDoc.$connections$.following_count || 1;
        actingUserDoc.$connections$.following_count--;

        // let current_count = (parseInt(userToFollowDoc.$connections$.followers_count / 100) + 1) * 100;

        // let current_following_count = (parseInt(actingUserDoc.$connections$.following_count / 100) + 1) * 100;

        let file_name = connectionIndex['$users_followers'][options.subjectId][options.actorId];
        let following_file_name = connectionIndex['$users_followings'][options.actorId][options.subjectId];

        delete connectionIndex['$users_followers'][options.subjectId][options.actorId];
        delete connectionIndex['$users_followings'][options.actorId][options.subjectId];

        // @@ persist main resource
        SqyDB.fncs.reCache_and_persist_updated_doc(userToFollowDoc, { collection: 'cpx_users' });
        SqyDB.fncs.reCache_and_persist_updated_doc(actingUserDoc, { collection: 'cpx_users' });

        // @@ persist connection
        const persistWorker = new Worker("./connections_worker.js", {
            smol: true,
        });


        persistWorker.postMessage({

            config,
            fnc: 'unpersist_connection_value',
            id: options.subjectId,
            toRemoveId: options.actorId,
            collection: '$users_followers',
            file_name,
            // value: options.value
        });

        persistWorker.postMessage({

            config,
            fnc: 'unpersist_connection_value',
            id: options.actorId,
            toRemoveId: options.subjectId,
            collection: '$users_followings',
            file_name: following_file_name,
            // value: options.value2
        });

        return { msg: 'OK' }


        // console.log('$post_likes :: ->', connectionIndex['$post_likes'], ' \n \n options.value -->', options.value);

        // return { msg: 'OK' }



    } catch (error) {

        console.log('Like Post Err ->', error);
        return { msg: 'Error' }
    }

};


SqyDB.db_ops.like_post = async function (options) {

    try {

        let updatedDoc = SqyDB_Cache['cpx_posts'][options.subjectId];

        if (!updatedDoc || !updatedDoc._id) { return { msg: '404' } }


        connectionIndex['$post_likes'][options.subjectId] = connectionIndex['$post_likes'][options.subjectId] || {};

        if (connectionIndex['$post_likes'][options.subjectId].hasOwnProperty(options.actorId)) {
            return { msg: '400' }
        }

        updatedDoc.$connections$ = updatedDoc.$connections$ || {};

        updatedDoc.$connections$.likes = updatedDoc.$connections$.likes || 0;
        updatedDoc.$connections$.likes++;

        let current_count = (parseInt(updatedDoc.$connections$.likes / 100) + 1) * 100;

        let file_name = current_count;

        connectionIndex['$post_likes'][options.subjectId][options.actorId] = "" + file_name;

        // @@ persist main resource
        SqyDB.fncs.reCache_and_persist_updated_doc(updatedDoc, { collection: 'cpx_posts' })


        // @@ persist connection
        const persistWorker = new Worker("./connections_worker.js", {
            smol: true,
        });

        persistWorker.postMessage({

            config,
            fnc: 'persist_connection_value',
            id: options.subjectId,
            collection: '$post_likes',
            file_name,
            value: options.value
        });

        console.log('$post_likes :: ->', connectionIndex['$post_likes'], ' \n \n options.value -->', options.value);

        return { msg: 'OK' }



    } catch (error) {

        console.log('Like Post Err ->', error);
        return { msg: 'Error' }
    }

};


SqyDB.db_ops.unlike_post = async function (options) {

    try {

        let updatedDoc = SqyDB_Cache['cpx_posts'][options.subjectId];

        if (!updatedDoc || !updatedDoc._id || !connectionIndex['$post_likes'][options.subjectId]) { return { msg: '404' } }

        // console.log(' kkk unlike post :: -->', connectionIndex['$post_likes'][options.actorId], options.subjectId, 'tolo --->>',
        //     connectionIndex['$post_likes'][options.actorId][options.subjectId]
        //   );

        // SqyDB_index[options.collection]._id[options.$where._id] = SqyDB_index[options.collection]._id[options.$where._id] || {};
        connectionIndex['$post_likes'][options.subjectId] = connectionIndex['$post_likes'][options.subjectId] || {}

        if (typeof connectionIndex['$post_likes'][options.subjectId][options.actorId] !== 'undefined') {

            SqyDB_Cache['cpx_posts'][options.subjectId].$connections$.likes--;

            let file_name = connectionIndex['$post_likes'][options.subjectId][options.actorId];
            delete connectionIndex['$post_likes'][options.subjectId][options.actorId];

            // @@ persist main resource
            SqyDB.fncs.reCache_and_persist_updated_doc(SqyDB_Cache['cpx_posts'][options.subjectId], { collection: 'cpx_posts' })

            // @@ persist connection
            const persistWorker = new Worker("./connections_worker.js", {
                smol: true,
            });

            let dd = {

                fnc: 'unpersist_connection_value',
                id: options.subjectId,
                toRemoveId: options.actorId,
                collection: '$post_likes',
                file_name,
                config,
                // value: options.value
            };

            persistWorker.postMessage(dd);

            // persit_remove(dd);


            console.log('unliking $post_likes :: ->', "connectionIndex['$post_likes']");

            return { msg: 'OK' }


        }

        return { msg: 'null' }




    } catch (error) {

        console.log('Like Post Err ->', error);
    }
};

// const the_data_file = Bun.file(`${config.db_data_dir + '/' + 'connections/$post_likes/11997V1VK2W9C254q316r3F8b8Vh1V1'}/100.sqydf`);
// let f = await the_data_file.text();

// let the_data_file = fs.readFileSync(`${config.db_data_dir + '/' + 'connections/$post_likes/11997V1VK2W9C254q316r3F8b8Vh1V1'}/100.sqydf`, 'utf8');

// console.log('fff  the_data_file --->', the_data_file );

// fs.writeFile(`/Applications/MAMP/htdocs/cpxDeploy/SqyDB_deploy/../_d_data/connections/$post_likes/11997V1VK2W9C254q316r3F8b8Vh1V1/100.sqydf`, 'new_file', function (err) {
//     if (err) throw err;
//     console.log('Saved!');
// });

SqyDB.fncs.update_sub_resource = async function (options) {

    try {

        if (options.ops == "$addTo") {

            // console.log(' ---->>>>> now updatig_sub_resource ', '\n SqyDB_index[options.collection] -->', options, SqyDB_index[options.collection] );

            SqyDB_index[options.collection]._id[options.$where._id] = SqyDB_index[options.collection]._id[options.$where._id] || {};


            let file_name = ((options.current_iteration || 0) + 1) * 10000;

            SqyDB_index[options.collection]._id[options.$where._id][options.indexKey] = "" + file_name;

            // options_.data = JSON.stringify(options_.data);
            let existingDataPath = config.db_data_dir + '/' + options.collection + '/' + options.$where._id;

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

            console.log(' ---->>>>> now updated_sub_resource ', SqyDB_index[options.collection]._id);

            return 'OK'
        }

        if (options.ops == "$removeFrom") {

            SqyDB_index[options.collection]._id[options.$where._id] = SqyDB_index[options.collection]._id[options.$where._id] || {};

            if (typeof SqyDB_index[options.collection]._id[options.$where._id][options.indexKey] !== 'undefined') {

                let holding_file = SqyDB_index[options.collection]._id[options.$where._id][options.indexKey];
                delete SqyDB_index[options.collection]._id[options.$where._id][options.indexKey];

                // @@ -- read holding file and remove this item
                let existingDataPath = config.db_data_dir + '/' + options.collection + '/' + options.$where._id;

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

SqyDB.db_ops.get_sub_resource = async function (options) {

    let _id = options.$where._id;

    console.log('Get sub res SqyDB_index[options.collection] for --->', _id, '\n', SqyDB_index[options.collection] && SqyDB_index[options.collection]._id[_id]);

    if (!_id) { return { msg: 'No ID supplied', error: true } }

    let sub_resource_index = SqyDB_index[options.collection]._id[_id];

    if (!sub_resource_index) {

        return { msg: 'No Sub Resource', error: true }
    }

    let sub_resource_results = [];
    for (const key in sub_resource_index) {
        // if (Object.hasOwnProperty.call(object, key)) {
        // const element = sub_resource_index[key];
        // }
        let cache_doc = SqyDB_Cache[options.sub_resource_parent_collection][key];

        // console.log(' options.$projection --->>', options.$projection[index] );

        // @@ so we don't throw an error for ids that for example are pages..
        // -- they obviously who exist in cpx_users
        if (typeof cache_doc !== 'undefined') {

            let send_user = {};

            options.$projection = options.$projection || ['_id'];

            for (let index = 0; index < options.$projection.length; index++) {

                // const element = array[index];
                // console.log(' options.$projection --->>', options.$projection[index] );
                // -- dot keys projections here later

                if (typeof cache_doc[options.$projection[index]] !== 'undefined') {
                    send_user[options.$projection[index]] = cache_doc[options.$projection[index]];
                }

            }

            sub_resource_results.push(send_user);

        }

    }

    return { msg: 'OK', docs: sub_resource_results }

};

SqyDB.db_ops.get_many_from_keys = async function (options) {

    // @@ get many from key from an existing data..
    if (!options.indexPointer || !options.dataKeyValues) {
        return { error: "key or values missing" }
    }

    let result = [];

    options.dataKeyValues.forEach(vals => {

        let indexPointer = options.indexPointer;
        indexPointer = indexPointer == '_id' ? indexPointer : 'others';

        let theIndex = SqyDB_index[options.fromCollection][indexPointer];

        if (theIndex && theIndex[vals] && SqyDB_Cache[options.fromCollection][theIndex[vals]]) {

            // SqyDB_Cache[options.fromCollection][theIndex[vals]]
            options.$projection = options.$projection || ['_id'];

            let d = {};

            options.$projection.forEach(pk => {

                d[pk] = SqyDB_Cache[options.fromCollection][theIndex[vals]][pk]

            })

            result.push(d);


        }
        // options.fromCollection
        // SqyDB_Cache[options.fromCollection][key]
        // SqyDB_index[options.collection]._id[_id]
    })

    return { msg: 'OK', docs: result }
    // @@ get many from key from an existing data..
    // E.g keys from an existing data

    // if (options.get_many_from_key
    //     && (options.get_many_from_key._id || options.get_many_from_key.__creator_)
    //     && options.get_many_from_key.key) {

    // }

    // let $creator$ = options.get_many_from_key.__creator_;
    // let _id = options.key._id || SqyDB_index[options.collection][$creator$];

    // let result = [];
    // options.get_many_from_key.value_projections = options.get_many_from_key.value_projections || ['_id'];


    // @@ get by _id
    // if (_id) {

    //     options.find_one_from_many = true;

    //     let res_ = filter_engine(SqyDB_cache[options.collection][_id], options, true);

    //     // return res_;
    //     if (res_.status == 'true') {

    //         // @@ work on key
    //         let data_key = options.get_many_from_key.key;
    //         let dv = res_.data[0][data_key];

    //         if (data_key.indexOf('.') > -1) {

    //             let k = data_key.split('.');

    //             if (k.length == 2) {
    //                 dv = res_.data[0][k[0]][k[1]];
    //             }

    //             if (k.length == 3) {
    //                 dv = res_.data[0][k[0]][k[1]][k[2]];
    //             }
    //             if (k.length == 4) {
    //                 dv = res_.data[0][k[0]][k[1]][k[2]][k[3]];
    //             }

    //             if (k.length == 5) {
    //                 dv = res_.data[0][k[0]][k[1]][k[2]][k[3]][k[4]];
    //             }

    //         }


    //         // @@ --- haven gotten dv.... next is to split if it's a string... with ~~
    //         if (dv.indexOf('~~') > -1) {

    //             // dv = dv.replace('~~~~', '~~');

    //             dv = dv.split('~~');
    //             let dvl = dv.length;

    //             let col = options.get_many_from_key.value_collection;

    //             for (let iv = 0; iv < dvl; iv++) {

    //                 const element = dvl[iv];

    //                 if (element.length > 3) {

    //                     let mainValue = options.get_many_from_key.value_type == '__creator_' ? SqyDB_cache[col][SqyDB_index[col][element]] : SqyDB_cache[col][element];

    //                     if (mainValue && mainValue._id) {

    //                         let d = {};
    //                         options.get_many_from_key.value_projections.forEach(pk => {

    //                             if (mainValue.hasOwnProperty(pk)) {

    //                                 d[pk] = mainValue[pk];
    //                             }
    //                         })

    //                         result.push(d);
    //                     }

    //                 }

    //             }

    //         }

    //         return result
    //         // return { data: a, __creator_: creator_final, '$$#system##' }


    //     }

    //     return "No Doc"

    // }

    // return "Invalid ID"


}

// @@ e.g check a follower's following
SqyDB.fncs.check_sub_resource = async function (options) { };

SqyDB.db_ops.reset_many = async function (options) {

    // let results = [];
    // let index = 0;
    // for ( index; index < options.many_options.length; index++) {
    //     const options = options.many_options[index];

    //     let res = await SqyDB.db_ops.reset(options);
    //     results.push(res);
    // }
    return new Promise((resolve) => {

        // return results
        let u = 0;
        let last_updated_doc = {};

        let run_func = async function () {

            if (u == options.many_options.length) {

                if (options.get_after_reset) {


                    let db_get_response = await SqyDB.db_ops.get(options.get_after_reset);

                    // console.log('KOOK Get User db_response -===>', db_get_response, options.get_after_reset );

                    if (db_get_response && db_get_response.msg == 'NULL') {

                        resolve({ msg: 'Reset Many OK. Get Resource not found', data: {} });
                    }

                    if (db_get_response && db_get_response.doc._id) {

                        // return { success: true, statusCode: 200, data: db_get_response }
                        resolve({ msg: 'Reset Many OK', data: db_get_response });
                    }

                    resolve({ msg: 'Reset Many OK. Error Getting Doc', data: {} });


                }
                else {
                    resolve({ msg: 'Reset Many OK' });
                }
            }

            else {

                let res = await SqyDB.db_ops.reset(options.many_options[u]);

                // console.log('many res')

                if (res.msg == 'OK') {

                    u++;
                    run_func();

                }
            }

        };

        run_func();

    })



};



SqyDB.db_ops.reset = async function (options) {

    // return await _reset(options, SqyDB_Cache, SqyDB_index, SqyDB_stats)
    let _id = options._id || (options.$where && options.$where._id);

    // @@ so it adds $UID$ et al
    options.forAuth = true;
    // options.forReset = true;

    // console.log('The great Resetter --===---><>>>>>>> _id :: ', _id, options.collection, 'options :: ->', options );

    if (typeof _id == 'string') {

        //    return await get_one_by_id(_id, options, SqyDB_Cache, SqyDB_index);
        // options.forAuth = true;
        let res_ = await SqyDB.db_ops.get(options);

        // console.log('1374 The great Resetter --===---><>>>>>>> _id :: ', "_doc, options.data ", res_, '\n options ---->', options );

        // console.log(' ---> update options :: -->', options, '\n res_ -->', res_,);

        // console.log('a --->  k  --->', options.$updateAuthorization.check.$creator,  res_.doc.$creator$ );

        // return { msg: 'OK', updatedDoc: {} }
        // --

        if (res_ && res_.doc && res_.doc._id) {

            // console.log(' ---> update 00 :: -->', options.$updateAuthorization.check.$creator, res_.doc, '.$creator$', '\n -->', options );

            // @@ Doc Auth first ---- 
            if (options.$updateAuthorization && options.$updateAuthorization.check) {

                if (options.$updateAuthorization.check.$creator !== res_.doc.$creator$) {
                    return { msg: 'authorized' }
                }
            }

            // -- 

            // @@ // @@ -- check for update_resource_collection
            // e.g followers on a user's follower's collection

            // if ( options.data['$update_sub_resource'] ) {

            //     let otherResoureOpt = options.data['$update_sub_resource'];

            //     delete options.data['$update_sub_resource'];

            //     await SqyDB.fncs.update_sub_resource(otherResoureOpt)

            // }

            delete options.data._id;

            let updatedDoc = await SqyDB.fncs.run_update_on_data(res_.doc, options.data);
            // let returnValues = {};

            // if (typeof options.return_after_reset == 'object' && typeof options.return_after_reset.length == 'number' && options.return_after_reset.length > 0) {

            //     options.return_after_reset.forEach(k => {

            //         let a;
            //         if (k.indexOf('.') > -1) {
            //             a = key.split('.');
            //             // let o = typeof data[a[0].trim()] !== 'undefined' ? data[a[0].trim()] : {};
            //             // if ()
            //             for (let index = 0; index < a.length; index++) {
            //                 // const element = array[index];
            //                 updatedDoc

            //             }

            //         }
            //         else {
            //             returnValues[k] = updatedDoc[k];
            //         }

            //         returnValues

            //     })
            // }

            SqyDB.fncs.reCache_and_persist_updated_doc(updatedDoc, options);

            return { msg: 'OK', updatedDoc }
        }

        return { msg: 'Docs not found' }

    }

    let $creator$ = options.$where && options.$where.$creator$;

    if ($creator$) {

        $creator$ = options.$where.$creator$;

        // @@ -- write a fnc to search across indexes in cluster -- later
        _id = SqyDB_index[options.collection].others[$creator$];

        let res_ = SqyDB.db_ops.get(options);

        if (res_ && res_.doc._id) {

            // @@ // @@ -- check for update_resource_collection
            // e.g followers on a user's follower's collection
            // if ( options.data['$update_sub_resource'] ) {
            //     let otherResoureOpt = options.data['$update_sub_resource'];
            //     delete options.data['$update_sub_resource'];

            //     await SqyDB.fncs.update_sub_resource(otherResoureOpt)
            // }

            let updatedDoc = await SqyDB.fncs.run_update_on_data(res_.doc, options.data);

            SqyDB.fncs.reCache_and_persist_updated_doc(updatedDoc, options);

            return { msg: 'OK', updatedDoc }
        }


        return { msg: 'Docs not found' }
    }


    return { msg: 'Missing Doc Identifier' }


};



SqyDB.fncs.unlink_doc = async function (_id, options) {


    // let _id = SqyDB_stats[options.collection].last_num + 'V' + SqyDB_stats[options.collection].last_node_dir + 'V' + _u.gen_id() + 'V' + config.dbn_prefix + 'V' + SqyDB.db_node;
    // num in folder / last node dir / id / db host / db_node
    // console.log('Persist time --->', updatedDoc );

    // @@ analyze updatedDoc._id to know where to Cache data
    let _id_array = _id.split('V');

    // console.log('_id_array --->>>>', _id_array, config.dbn_prefix);

    // @@ if this data should be operated on by this node 
    // @@ -- also check if the collection for this category was cached later 
    if (_id_array[4] == SqyDB.db_node) {

        // SqyDB_Cache[options.collection][updatedDoc._id] = updatedDoc;

        let path_plus_item_id = config.db_data_dir + '/' + options.collection + '/' + _id_array[1].padStart(6, "0") + '/' + _id;

        // const path = "/path/to/file.txt";
        await unlink(`${path_plus_item_id}.json`);
        // return ''
    }
    else {

        // @@ make a request to the appropriaet node for a cache update

    }

};

SqyDB.db_ops.unset = async function (options) {
    // return await _unset(options)

    let _id = options._id || (options.$where && options.$where._id);

    // console.log('The great Resetter --===---><>>>>>>> _id :: ', _id, options.collection, 'options :: ->', options );

    if (typeof _id == 'string') {

        //    return await get_one_by_id(_id, options, SqyDB_Cache, SqyDB_index);
        // let res_ = await SqyDB.db_ops.get(options);


        // console.log('317 The great Resetter --===---><>>>>>>> _id :: ', "_doc, options.data ", res_, '\n options ---->', options );


        let key = SqyDB_index[options.collection]['_id'][_id];

        console.log('unset options :: -->', options, '\n key -->', key);

        // return { msg: 'working' }

        // console.log('a --->  k  --->', options.$updateAuthorization.check.$creator,  res_.doc.$creator$ );
        // --
        // Use maps instead of array for Sorts later
        // map serves as sorter plus indexer since ther's order

        if (typeof key == 'string') {

            let cData = SqyDB_Cache[options.collection][key];

            if (cData && cData._id) {

                // @@ Doc Auth first ---- 
                if (options.$updateAuthorization && options.$updateAuthorization.check) {

                    if (options.$updateAuthorization.check.$creator !== cData.$creator$) {
                        return { msg: 'authorized' }
                    }
                }

                // @@ delete ops
                // remove from index
                delete SqyDB_index[options.collection]['_id'][_id]
                // console.log('Delete options :: -->', options);

                // nullify collection cache
                // -- increase coll count --- 
                SqyDB_stats[options.collection].last_num++;


                // @@ remove from cache ---
                delete SqyDB_Cache[options.collection][key];

                // @@ unlink file in dir
                await SqyDB.fncs.unlink_doc(_id, options);

                return { msg: 'OK' }


            }
            return { msg: 'Doc not found' }


        }

        return { msg: 'Doc not found' }

    }

    return { msg: 'No ID supplied' }


};

SqyDB.fncs.send_queue_to_worker_for_persisting = async function () {

    // @@ ---- Send Queue to worker for prsist job
    if (!SqyDB.isWorking) {

        SqyDB.isWorking = true;

        // @@ send Queue to worker for writing    
        SqyDB.connect.worker.send(

            JSON.stringify(

                {
                    work_type: 'persist_queue_to_disk',
                    clientId: `SqyDB_node_${SqyDB.db_node}`,
                    SqyDB_Worker_Queue

                }

            )

        );

        // @@ -- Clear SqyDB_Worker_Queue
        SqyDB_Worker_Queue = {};

    }

}


/** 
 * @@ Cache Queue and persit data passed here...
 * Setup folder creation etc
 * --- The Params is an object containing both db name to set collection on and the collection name
 */

// persistWorker.addEventListener("message", event => {

//     console.log('persistWorker returned a message :: -->', event.data);
// });

// let fakeQ = new Map();
// let fake_count = 0;

// setInterval( function() {

//     fakeQ.set(`id_${fake_count}`, {
//         num: fake_count,
//         date: Date.now(),
//     })
//     persistWorker.postMessage(fakeQ);

// }, 1000 );

// @@ Queue writes later ---

SqyDB.fncs.queue_cache_persist = async function (options_) {

    console.log('Time to Cache and persist. ---=>', options_.path_plus_item_id);
    // queueOne.set(options_.path_plus_item_id, options_);

    // @@ quickly experiment write
    // options_.data = JSON.stringify(options_.data);


    // SqyDB_Worker_Queue[`${options_.data._id}_set_${Date.now()}`] = options_;
    // await Bun.write(options_.path_plus_item_id + '.json', options_.data);


    // const bytes = await Bun.write(options_.path_plus_item_id + '.json', options_.data);

    // await SqyDB.fncs.send_queue_to_worker_for_persisting();

    /**   
    * @@ -- Persist worket Set OPs
    * @@ -- Yay
    */

    // if (!SqyDB.is_persisting) {

    // const send_to_worker = function () {

    const persistWorker = new Worker("./Persist.js", {
        smol: true,
    });

    // persistWorker.postMessage({

    //     fnc: 'write_doc',
    //     //  data: {

    //     //      otp: OTP,
    //     //      email: emailOne// reqObj.payloadData['reset_email']

    //     //  }
    //     queue: SqyDB_Worker_Queue
    // });

    // }

    // persistWorker.postMessage(queueOne);
    persistWorker.postMessage(options_);

    // }


    // console.log('data persisted. ---=>', bytes);

};


/** 
 * @@ Initialize the DBS
 * Setup folder creation etc
 * Setup DB cace
 * --- The Params is an object containing both db name to set collection on and the collection name
 */

// SqyDB.initialize_collections = function () {
// }


/** 
 * @@ Create a collection on a DB when, say, a Model is initialized
 * Setup folder creation etc
 * --- The Params is an object containing both db name to set collection on and the collection name
 */

SqyDB.db_ops.setup_resource_collection = async function (options_) {

    console.log('__ ------++---------- setup_resource_collection :: ---<>>>>', options_);

    if (!fs.existsSync(`${config.db_data_dir}/${options_._id}`)) {

        // console.log(`${workData.collection} doesn't exist -- gotta create`);

        // Create collection folder here
        fs.mkdir(`${config.db_data_dir}/${options_._id}`, (err) => {

            if (err) { console.error(err); return }

            console.log(`Resource connections dir:: created successfully!`);

        });

    }
}
/** 
 * @@ Create a collection on a DB when, say, a Model is initialized
 * Setup folder creation etc
 * --- The Params is an object containing both db name to set collection on and the collection name
 */

SqyDB.db_ops.initialize_collection = async function (options_) {

    // if (!options_ || !options_.db || !options_.collection) { return }
    // console.log('Request to init collection --->', options_.collection);
    // * -- @@  -- polling 
    // -- This will only go through after load cache and DB is ready...
    // -- @@ so it makes sense that if this collection's stats hasn't been set from 
    // -- load cachec ops.. then set defaults and proceed with creating folder..
    // -- meaning it's a fresh collection.. 
    // if (config.collection_x.indexOf(options_.collection) > -1) {


    //     console.log('Special collection ', options_.collection, ' hit :: ---- >><< ----- ');

    //     SqyDB_index[options_.collection] = SqyDB_index[options_.collection] || { _id: {} };

    //     return 'OK'
    // }

    if (!SqyDB_stats[options_.collection]) {

        SqyDB_stats[options_.collection] = SqyDB_stats[options_.collection] || { last_num: config.db_node_limit, last_node_dir: 1 };

        SqyDB_index[options_.collection] = SqyDB_index[options_.collection] || { _id: {}, others: {} };

        SqyDB_Cache[options_.collection] = SqyDB_Cache[options_.collection] || {};

        SqyDB_sort_cache[options_.collection] = SqyDB_sort_cache[options_.collection] || [];

        let this_col_index = [];
        if (config.collection_index && config.collection_index[options_.collection]) {
            this_col_index = ['_id', ...config.collection_index[options_.collection]]
        }

        // console.log(' this_col_index -===>', this_col_index );
        SqyDB_stats[options_.collection].collection_index = this_col_index;

    }

    // console.log( ' sending to worker Working', ' SqyDB.connect.worker :: ---> ' );

    // @@ Do folder creation or sif not exist
    SqyDB.connect.worker.send(

        JSON.stringify({

            work_type: 'check_or_setup_collection',
            clientId: options_.clientId,
            collection: options_.collection,
            inDir: config.db_data_dir

        })

    );


    return 'OK'

    // console.log(' initialize_DBs done -->', (Date.now() - startTime) / 1000, 'seconds');


}

SqyDB.setup_worker_connection = function () {


    SqyDB.connect.worker = new WebSocket(`ws://localhost:${config.db_worker_port}`);

    // console.log('--- now setting up DB Connection for --->', this.collection, 'SqyDB.connect.cache');

    SqyDB.connect.worker.onopen = function (event) {

        console.log(' Socket connected -===-----<<<>>><><<>>> ', 'SqyDB. worker connection intialized on DB');

    };

    SqyDB.connect.worker.onmessage = async function (e) {

        const workerResponse = JSON.parse(e.data);
        // let sock_ = this.socket;

        // console.log('in dnode 188 Worker returned message -===-----<<<>>><><<>>> ', payLoad, 'SqyDB.connect.cache');

        console.log(' in dnode 317 Worker Response -===-----<<<>>><><<>>> ',
            workerResponse, 'SqyDB.connect.worker'
        );

        // @@ when we done persisting Queue -===== 
        if (workerResponse.result && workerResponse.result == 'persist_queue_to_disk') {

            SqyDB.isWorking = false;

            if (workerResponse.msg == 'DONE') {

                // @@ Check Queue for more persist jobs
                if (Object.keys(SqyDB_Worker_Queue).length > 0) {

                    // @@ -- send queue job to worker
                    SqyDB.fncs.send_queue_to_worker_for_persisting();
                }

            }

        }

        if (workerResponse.result && workerResponse.result == 'check_or_setup_collection') {

            // SqyWorker.fncs[event.data.fnc](event.data);
            // console.log('SqyDB worker sent back result  --->', event.data, 'args ::', `${Bun.argv[Bun.argv.indexOf('--node') + 1]}` );
            // if (workerResponse.msg == 'EXISTS' && !SqyDB.now_caching_from_disk) {

            //     SqyDB.now_caching_from_disk = true;

            //     let scan_coll_res = await scan_and_cache_collections({
            //         node: `${Bun.argv[Bun.argv.indexOf('--node') + 1]}`,
            //         inDir: config.db_data_dir
            //     });


            //     SqyDB_Cache = scan_coll_res.SqyDB_cache;
            //     SqyDB_stats = scan_coll_res.SqyDB_stats;

            //     console.log('scan_coll_res -====<>>>>>', ' --> ', Object.keys(SqyDB_Cache['cpUser']).length);

            //     scan_coll_res = null;
            //     SqyDB.isReady = true;

            // }

            // if ( workerResponse.msg == 'DONE' && !SqyDB.now_caching_from_disk ) {

            //     SqyDB.isReady = true;

            // }

            // SqDBWorker.terminate();


        }

    }

};

SqyDB.connect.worker.onclose = function (e) {

    // const payLoad = JSON.parse(e.data);

    // console.log('Socket close -===-----<<<>>><><<>>> ', e);
    setTimeout(function () {
        SqyDB.setup_worker_connection();
    }, 800)

};


SqyDB.scanIsDone = 0;

SqyDB.scan_done = function () {

    SqyDB.scanIsDone++

    console.log(' scanIsDone ---> ', SqyDB.scanIsDone );

    // admin_report, SqyDB_Cache, commentsCache, connectionIndex

    if ( SqyDB.scanIsDone == 4 ) {
        SqyDB.isReady = true;
    }

}

SqyDB.load_cache_from_disk = async function () {


    let startTime = Date.now();
    // SqyDB.now_caching_from_disk = true;

    let scan_coll_res = await scan_and_cache_collections({
        node: `${Bun.argv[Bun.argv.indexOf('--node') + 1]}`,
        inDir: config.db_data_dir
    });

    // @@ for each collection in Stats
    // for (const collection_ in scan_coll_res.SqyDB_stats) {

    // if (Object.hasOwnProperty.call(object, key)) {
    //     const element = object[key];
    // }/;llk
    // @@ set Stats, Cache and Index after load cahce Ops
    SqyDB_stats = scan_coll_res.SqyDB_stats;
    SqyDB_index = scan_coll_res.SqyDB_index;
    SqyDB_Cache = scan_coll_res.SqyDB_cache;
    SqyDB_sort_cache = scan_coll_res.SqyDB_sort_cache;

    // }
    // SqyDB.scan_done();

    // SqyDB_Cache = scan_coll_res.SqyDB_cache; 
    // SqyDB_stats = scan_coll_res.SqyDB_stats;

    // console.log('Load Cache Res -====<>>>>>', ' --> ', '\n SqyDB_index.$followings --->', scan_coll_res.SqyDB_index.$followings, '\n SqyDB_index.$followers --->', scan_coll_res.SqyDB_index.$followers, `Object.keys(SqyDB_Cache['cpUser']).length --====--->`, "SqyDB_index['cpx_entity']['_id']", (Date.now() - startTime) / 1000);
    // console.log('Load Cache Res -====<>>>>>', ' --> ', scan_coll_res.SqyDB_index.cp_comments, '\n SqyDB_index.$followers --->', (Date.now() - startTime) / 1000);

    // console.log('2001 Load Cache Res -====<>>>>>', ' --> ', '\n SqyDB_index --->', scan_coll_res.SqyDB_index, (Date.now() - startTime) / 1000);


    const persistWorker = new Worker("./connections_worker.js", {
        smol: true,
    });

    persistWorker.postMessage({

        fnc: 'create_or_scan',
        config
        //  data: {

        //      otp: OTP,
        //      email: emailOne// reqObj.payloadData['reset_email']

        //  }
        // queue: SqyDB_Worker_Queue
    });

    persistWorker.onmessage = ((event) => {

        console.log('persistWorker recieved :: -->', event.data);

        connectionIndex = event.data.connection_index;
        SqyDB.scan_done();

    })


    // @@ comments worker -----

    const commentsWorker = new Worker("./comments_worker.js", {
        smol: true,
    });

    commentsWorker.postMessage({

        fnc: 'create_or_scan',
        config

    });

    commentsWorker.postMessage({

        fnc: 'fetch_admin_report',
        config

    });

    commentsWorker.onmessage = ((event) => {

        console.log(' Comments Worker received :: -->', 'event.data');

        // connectionIndex = event.data.comment_index;

        if (event.data.commentsCache) {
            commentsCache = event.data.commentsCache;
        }

        else {
            admin_report = event.data.admin_report;
        }

        SqyDB.scan_done();
        // commentsWorker.exit();

    });


    // set DB to ready afterwards --- //
    let timerU = setTimeout(function () {

        scan_coll_res = null;
        // SqyDB.isReady = true;
        SqyDB.scan_done();

        // console.log('scan AA')

        clearTimeout(timerU);
        timerU = null;

    }, 200);




}


SqyDB.open_connection_interface = function () {

    let node_arg = Bun.argv[Bun.argv.indexOf('--node') + 1];

    console.log(` Conection to DB Server Open ${node_arg} --> `, config.db_port + (parseInt(node_arg) - 1));
    SqyDB.db_node = node_arg;

    const server = Bun.serve({

        port: config.db_port + (parseInt(node_arg) - 1),

        async fetch(req) {

            let payLoad = await req.json();

            if (!SqyDB.isReady) {

                return new Response(

                    JSON.stringify({ response: 'DB NOT READY' }),
                    {
                        headers: { 'Content-Type': 'application/json' },
                        status: 200
                    }
                );

            }


            if (payLoad.db_action && typeof SqyDB.db_ops[payLoad.db_action] == 'function') {


                let db_res = await SqyDB.db_ops[payLoad.db_action](payLoad);

                // console.log(' 618 db_res in dnode -====>>>', db_res);

                return new Response(
                    // JSON.stringify( { db_fnc_response: payLoad.db_fnc, response: db_fnc_res }),
                    JSON.stringify({ db_action_response: payLoad.db_action, response: db_res }),
                    {
                        headers: { 'Content-Type': 'application/json' },
                        status: 200
                    }
                );

            }

            // @@ return failed --- 

        },

        error(error) {

            console.log('the error ---==>', error);

            return new Response(
                JSON.stringify({ msg: 'Error connecting to DB' }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    status: 500
                }
            );


        },
    });

    console.log(`DB -- Listening on ${server.url}`);


};

SqyDB.start = function () {

    SqyDB.node_num = parseInt(Bun.argv[Bun.argv.indexOf('--node') + 1]);


    SqyDB.open_connection_interface();

    // @@ load Cache after opening connection
    SqyDB.load_cache_from_disk();

    // @@ setup worker connection
    SqyDB.setup_worker_connection();

    // console.log('db dir --', config.db_data_dir );

}


SqyDB.start();