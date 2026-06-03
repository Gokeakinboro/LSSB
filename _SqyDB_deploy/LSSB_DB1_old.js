
import fs from 'node:fs';
import { unlink } from "node:fs/promises";

import { join } from 'node:path';

const { config } = await import('./_config.js');

// const { _set } = await import('./_lib_/_set.js');

// const { _get } = await import('./_lib_/_get.js');

const { _u } = await import('./_lib_/_u.js');

const { scan_and_cache_collections } = await import('./_lib_/scan_and_cache_collections.js');

// const { _check_exists } = await import('./_lib_/_check_exists.js');

// const { _reset } = await import('./_lib_/_reset.js');

// const { _unset } = await import('./_lib_/_unset.js');

const { filter_engine } = await import('./_lib_/filter_engine.js');


const SqyDB = {};

let SqyDB_stats = {};

let SqyDB_Cache = {};

let SqyDB_sort_cache = {};

let SqyDB_index = { _id: {}, others: {} };

SqyDB.fncs = {};

SqyDB.db_ops = {};

SqyDB.is_caching = false;

SqyDB.isWorking = false;

SqyDB.db_ready = false;

// @@ attache socket here
SqyDB.connect = { cache: {}, worker: {} };

SqyDB.connection_state = {};

let SqyDB_Worker_Queue = {};



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
        // -- if it's 12000th num we move to the next node folder and start from 1
        SqyDB_stats[options.collection].last_num--;

        if (SqyDB_stats[options.collection].last_num === 0) {
            SqyDB_stats[options.collection].last_num = 12000;
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


        SqyDB.fncs.queue_cache_persist({
            path_plus_item_id,
            data: options.data
        })

        return { _id, msg: 'OK' }



    } catch (error) {

        console.log('set error -->', error)

        return { msg: 'Error' }

    }

};


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


            if ( options.$return_data ) {

                return { 
                    msg: true, 
                    _id: SqyDB_index[options.collection].others[where_val],
                    data: SqyDB_Cache[options.collection][_id]  
                }
            }

            return { msg: true, _id: SqyDB_index[options.collection].others[where_val]  }
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
SqyDB.db_ops.check_grant_access_mode_and_pay_status = async function (options) {

}

// @@ Collections in chronological or reverse chron order
SqyDB.db_ops.listDocumentsByDate = async function (options) { }

// @@ Collections in chronological or reverse chron order
SqyDB.db_ops.listDocuments = async function (options) {

    // console.log('--====---> getting Posts', options, "SqyDB_index['cpPosts']['_id']");

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

            // let post_id = SqyDB_index['cpPosts']['_id'][key];
            // let post_id = SqyDB_index['cpPosts']['_id'][key._id];
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
                                        useJoinD._fields.password = '#ENCRYPTED#';
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
                            data_x._fields.password = '#ENCRYPTED#';
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

    // console.log('--====---> Store :: ', SqyDB_index['crossStore'] );

    // console.log('--====---> listDocuments for', 'options', SqyDB_sort_cache[options.collection], '\n skip :: ->', skip, documents );



    return { status: 'ok', documents }

};


// @@ Collections in chronological or reverse chron order
SqyDB.db_ops.fetch_admin_report = async function (options) { 


    // console.log('Fetch admin report ::: ---> ', options);

    return { msg: 'OK', report: {

        grants_count: SqyDB_sort_cache['LSSB_grants'].length,
        applicants_count: SqyDB_sort_cache['LSSB_applicants'].length,
        applications_count: SqyDB_sort_cache['LSSB_applications'].length,
        bursary_count: 0,
        scholarship_count: 0,
        total_pending_pay: 0,

    } }
    // koko 

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
        // -- they obviously who exist in cpProfiles
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

            await SqyDB.fncs.reCache_and_persist_updated_doc(updatedDoc, options);

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

            await SqyDB.fncs.reCache_and_persist_updated_doc(updatedDoc, options);

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

        // SqyDB.fncs.queue_cache_persist({
        //     path_plus_item_id,
        //     data: updatedDoc
        // })

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

// @@ Queue writes later ---

SqyDB.fncs.queue_cache_persist = async function (options_) {

    // console.log('Time to Cache and persist. ---=>', options_);

    // @@ quickly experiment write
    options_.data = JSON.stringify(options_.data);


    // SqyDB_Worker_Queue[`${options_.data._id}_set_${Date.now()}`] = options_;
    await Bun.write(options_.path_plus_item_id + '.json', options_.data);
    // const bytes = await Bun.write(options_.path_plus_item_id + '.json', options_.data);

    // await SqyDB.fncs.send_queue_to_worker_for_persisting();


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
    if (config.collection_x.indexOf(options_.collection) > -1) {


        console.log('Special collection ', options_.collection, ' hit :: ---- >><< ----- ');

        SqyDB_index[options_.collection] = SqyDB_index[options_.collection] || { _id: {} };

        return 'OK'
    }

    if (!SqyDB_stats[options_.collection]) {

        SqyDB_stats[options_.collection] = SqyDB_stats[options_.collection] || { last_num: 12000, last_node_dir: 1 };

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

    // console.log('sending to worker Working', 'SqyDB.connect.worker');

    // @@ Do folder creation or sif not exist
    SqyDB.connect.worker.send(

        JSON.stringify({
            work_type: 'check_or_setup_collection',
            clientId: options_.clientId, collection: options_.collection,
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

        console.log('Socket connected -===-----<<<>>><><<>>> ', 'SqyDB. worker connection intialized on DB');

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



SqyDB.load_to_cache_from_disk = async function () {


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

    // SqyDB_Cache = scan_coll_res.SqyDB_cache;
    // SqyDB_stats = scan_coll_res.SqyDB_stats;

    // console.log('Load Cache Res -====<>>>>>', ' --> ', '\n SqyDB_index.$followings --->', scan_coll_res.SqyDB_index.$followings, '\n SqyDB_index.$followers --->', scan_coll_res.SqyDB_index.$followers, `Object.keys(SqyDB_Cache['cpUser']).length --====--->`, "SqyDB_index['cpEntity']['_id']", (Date.now() - startTime) / 1000);
    // console.log('Load Cache Res -====<>>>>>', ' --> ', scan_coll_res.SqyDB_index.cp_comments, '\n SqyDB_index.$followers --->', (Date.now() - startTime) / 1000);

    console.log('2001 Load Cache Res -====<>>>>>', ' --> ', '\n SqyDB_index --->', scan_coll_res.SqyDB_index, (Date.now() - startTime) / 1000);

    // set DB to ready afterwards
    let timerU = setTimeout(function () {

        scan_coll_res = null;
        SqyDB.isReady = true;

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
    SqyDB.load_to_cache_from_disk();

    // @@ setup worker connection
    SqyDB.setup_worker_connection();

    // console.log('db dir --', config.db_data_dir );

}


SqyDB.start();