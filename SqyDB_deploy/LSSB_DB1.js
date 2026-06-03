const { config } = await import('./_config.js');

const { _u } = await import('./_lib_/_u.js');

const { filter_engine } = await import('./_lib_/filter_engine.js');

const { scan_disk_to_cache } = await import('./_lib_/scan_disk_to_cache.js');

const { value_from_key_depth } = await import('./_lib_/value_from_key_depth.js');

const { connection_functions } = await import('./_lib_/connection_functions.js');

const { create_extra_collections } = await import('./_lib_/create_extra_collections.js');



const SqyDB = {
    db_ops: {},
    fncs: {}
};

let _Connections = {};

const _Cache = {};

const _CacheIndex = { _id: {}, others: {} };

const _CacheStats = {}

const db_fncs = {};

const _CacheKeys = {};

let admin_report = { report: {} };

const _commentsCache = {};
const _commentsIndex = {};

// @@ final DB action to set , unset cinnection
SqyDB.db_ops.set_unset_connections = async function (options) {

    // console.log('set_unset_connections hit :: --->', options );
    if (typeof connection_functions[options.connection_type] == 'function') {

        options.dir = config.db_data_dir;
        options.connection_node_limit = config.connection_node_limit;

        if (options.connection_type == 'add_comment' || options.connection_type == 'remove_comment') {

            options.config = config;
            options.db_node = SqyDB.db_node;
            options.gen_id = _u.gen_id;
            return await connection_functions[options.connection_type](_Cache, _commentsCache, _commentsIndex, _Connections, admin_report, options);
        }

        return await connection_functions[options.connection_type](_Cache, _Connections, admin_report, options);
    }

    return { error: 'Invalid Conn Ops' }
};


// @@ Collections in chronological or reverse chron order
SqyDB.db_ops.fetch_admin_report = async function (options) {


    // console.log('Fetch admin report ::: ---> ', options);

    return {
        msg: 'OK', report: {

            grants_count: _CacheKeys['LSSB_grants'].length,
            applicants_count: admin_report.report.users_count,
            applications_count: _CacheKeys['LSSB_applications'].length,
            bursary_count: 0,
            scholarship_count: 0,
            total_pending_pay: 0,

        }
    }
    // koko 

};

// @@ Collections in chronological or reverse chron order
// SqyDB.db_ops.fetch_admin_report = async function (options) {


//     // console.log('Fetch admin report ::: ---> ', options);

//     return {

//         msg: 'OK', admin_report
//     }


// };

SqyDB.db_ops.set = async function (options) {

    try {

        // set_hit++;
        // console.log('set hit KBU -=====>', set_hit );

        // return { _id: '_AABBCC', msg: 'OK' }

        if (!SqyDB.isReady) { return { msg: 'DB NOT READY' } }

        // let ops_res = await _set(options, _Cache, _CacheStats, SqyDB.db_node, config.dbn_prefix);

        // console.log('set Ops Resm-====>', ops_res );


        if (typeof options.data == 'undefined') { return { msg: 'No data provided' } }

        /* 
        * @@ 1. Generate a unique id 
        * @@ 2. save to cache -- might be needed soon 
        * @@ 3. save to BD Queue so job workers can persist on disk
        * 
        *!*/

        // console.log('set hit', options, _CacheStats, options.collection, '\n this coll stats --><>><>>>>', _CacheStats[options.collection]);


        // return { _id: 'null', msg: 'OK' }
        // * @@ 1. Generate a unique id 
        // @@ this helps solves the order_of_creation problem
        // -- OS folders can now archive based on  numbering
        // let last_num = _CacheStats[options.collection].last_num;
        // let last_node_dir = _CacheStats[options.collection].last_node_dir;

        // @@ Set last num and last node
        // -- if it's config.db_node_limitth num we move to the next node folder and start from 1
        _CacheStats[options.collection].last_num--;

        if (_CacheStats[options.collection].last_num === 0) {

            _CacheStats[options.collection].last_num = config.db_node_limit;
            _CacheStats[options.collection].last_node_dir++;

        }


        // last_num = last_num == config.db_doc_limit ? 0 : last_num + 1;
        // last_node_dir = last_num == config.db_doc_limit ? last_node_dir + 1 : last_node_dir;

        // "dn10001z1b7D0O7T9p1u2O2m115o4p558001"

        // let _last_node_dir = _u.preceeder_(_CacheStats[options_.collection].last_node_dir, 5);

        // let _id = config.dbn_prefix + _u.preceeder_(last_num, 4) + gen_id().substring(0, 12) + _last_node_dir;

        let _id = '';

        function check_id() {

            // let _id = dbn_prefix + _u.preceeder_(last_num, 4) + _u.gen_id() + _last_node_dir;
            // if () {}
            // Num in folder / node folder / id / host id = dbn_prefix /  node on host
            let col_pre = config.collection_id_helper && config.collection_id_helper[options.collection] ? config.collection_id_helper[options.collection] : "idd";
            let _id = col_pre + "V" + _CacheStats[options.collection].last_num + 'V' + _CacheStats[options.collection].last_node_dir + 'V' + _u.gen_id() + 'V' + config.dbn_prefix + 'V' + SqyDB.db_node;

            if (_CacheIndex[options.collection][_id]) {

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
        // _CacheIndex[options.collection][_id] = _id;

        // console.log(' _CacheStats[options.collection].co -->', _CacheStats, 'options.data._id --->', options.data._id );

        _CacheStats[options.collection].collection_index.forEach(indx => {

            // if ( options.data[indx] && _CacheIndex[options.collection][indx]) {
            // if (indx == '_id' && value_from_key_depth(indx, options.data) !== '$null' && _CacheIndex[options.collection][indx]) {
            //     _CacheIndex[options.collection][indx][options.data[indx]] = options.data._id;
            // }

            let v = value_from_key_depth(indx, options.data);

            // if ( v !== '$null') {
            //     _CacheIndex[options.collection][v] = options.data._id;
            // }

            if (indx == '_id' && v !== '$null' && _CacheIndex[options.collection][indx]) {
                _CacheIndex[options.collection][indx][options.data[indx]] = options.data._id;
            }

            if (indx !== '_id' && v !== '$null') {
                _CacheIndex[options.collection]['others'][v] = options.data._id;
            }

        })

        // console.log(' After Post -->', _CacheIndex[options.collection]);

        // @@ set time
        options.data['$t$'] = Date.now();


        // @@ --- cache -=====================-----------------------------==
        // _Cache[options.collection].set(_id, options.data);
        _Cache[options.collection][_id] = options.data;

        if (config.sort_collection.indexOf(options.collection) > -1) {

            _CacheKeys[options.collection].unshift({

                $t$: options.data['$t$'],
                _id
            })
        }


        // console.log( ' in _set -----> now setting ---> ', 'options.data', 'gen_id()', _id, '_CacheKeys', _CacheKeys[options.collection].length,  _CacheKeys[options.collection][0]  );


        // let path_plus_item_id = config.db_data_dir + '/' + options.collection + '/' + _u.preceeder_(_CacheStats[options.collection].last_node_dir, 5) + '/' + _id;
        // let path_plus_item_id = config.db_data_dir + '/' + options.collection + '/' + ("" + _CacheStats[options.collection].last_node_dir).padStart(6, "0") + '/' + _id;
        let path_plus_item_id = config.db_data_dir + '/' + options.collection + '/' + ("" + _CacheStats[options.collection].last_node_dir) + '/' + _id;

        // console.log('in _set --- Time to cache and persist -->>>>', {
        //     path_plus_item_id,
        //     data: options.data
        // })

        // console.log('in _set --- 225 -->>>>', options);

        if (options.$afterSetFnc && typeof db_fncs[options.$afterSetFnc] == 'function') {

            db_fncs[options.$afterSetFnc](options.data, options);
        }
        // @@ -- like reset.. afterFn is responsible for persisting data
        else {

            // @@ you were working on persisting via worker
            SqyDB.fncs.queue_cache_persist({
                fnc: 'set_doc_to_disk',
                path_plus_item_id,
                data: options.data
            });
        }



        return { _id, msg: 'OK' }



    } catch (error) {

        console.log('set error -->', error)

        return { msg: 'Error' }

    }

};


// db_fncs.after_create_lssb_user = async function (data, options) {


//     try {

//     } catch (error) {
//         console.log(' error :: ---> ', error);
//     }

// };

// @@ enity should increase linkup count

// @@ entity should get link-up record saved

// @@ -- Link-up user should have record saved in pages_user_follow or group_user_joined

// @@ -- saved as -- id:date~~type e.g id:date~~type

db_fncs.after_create_lssb_user = async function (data, options) {


    try {

        // connection_functions.after_create_entity();

        // _Cache['cpx_entity'][data._id];
        // @@ recache first

        let _id_array = data._id.split('V');


        _Cache['LSSB_users'][data._id] = options.data;

        // @@ if this data should be operated on by this node 

        admin_report.report.users_count = admin_report.report.users_count || 0;
        admin_report.report.users_count++

        // @@ -- also check if the collection for this category was cached later 
        if (_id_array[5] == SqyDB.db_node) {

            _Cache[options.collection][data._id] = data;

            // let path_plus_item_id = config.db_data_dir + '/' + options.collection + '/' + _id_array[1].padStart(6, "0") + '/' + updatedDoc._id;
            let path_plus_item_id = config.db_data_dir + '/' + options.collection + '/' + _id_array[2] + '/' + data._id;

            SqyDB.fncs.queue_cache_persist({

                dir: config.db_data_dir,
                fnc: 'set_doc_to_disk',
                path_plus_item_id,
                admin_report,
                data: options.data,
                data_collection: 'LSSB_users',
                // add_creator_connection: options.$extras && options.$extras.add_creator_connection ? options.$extras.add_creator_connection : null,
                // authorData,
                // postData: data,
                // entityAuthorData

            })
            // return ''

        }




    } catch (error) {
        console.log(' error :: ---> ', error);
    }

}



db_fncs.after_create_store_item_ = async function (data, options) {


    try {

        // connection_functions.after_create_entity();

        // _Cache['cpx_entity'][data._id];
        // @@ recache first

        let _id_array = data._id.split('V');

        // console.log(' after create post  --->>>>', options );
        let user_id = data.postAuthor.authorId;
        let entity_id = data.postEntity ? data.postEntity._id : 'null';
        let authorData = _Cache['cpx_users'][user_id];
        let entityAuthorData = null;

        if (entity_id !== 'null') {

            entityAuthorData = _Cache['cpx_entity'][entity_id];

            // authorData = _Cache['cpx_users'][user_id] = '';

            entityAuthorData.$connections$ = entityAuthorData.$connections$ || {};
            entityAuthorData.$connections$.post_count = entityAuthorData.$connections$.post_count || 0;
            entityAuthorData.$connections$.post_count++;

            entityAuthorData.$extras$.post_count_track = entityAuthorData.$extras$.post_count_track || { last_num: config.db_comment_node_limit + 1, last_node_dir: 1 };
            // resourceDoc.$extras$.comments_track.last_count = 0;
            // resourceDoc.$extras$.comments_track.last_node_dir = 0;

            entityAuthorData.$extras$.post_count_track.last_num--;

            if (entityAuthorData.$extras$.post_count_track.last_num === 0) {

                entityAuthorData.$extras$.post_count_track.last_num = config.db_comment_node_limit;
                entityAuthorData.$extras$.post_count_track.last_node_dir++;

            }

            _Cache['cpx_entity'][entity_id] = entityAuthorData;

        }

        // @@ -- the users post count
        authorData.$connections$ = authorData.$connections$ || {};
        authorData.$connections$.post_count = authorData.$connections$.post_count || 0;
        authorData.$connections$.post_count++;

        authorData.$extras$.post_count_track = authorData.$extras$.post_count_track || { last_num: config.db_comment_node_limit + 1, last_node_dir: 1 };
        // resourceDoc.$extras$.comments_track.last_count = 0;
        // resourceDoc.$extras$.comments_track.last_node_dir = 0;

        authorData.$extras$.post_count_track.last_num--;

        if (authorData.$extras$.post_count_track.last_num === 0) {

            authorData.$extras$.post_count_track.last_num = config.db_comment_node_limit;
            authorData.$extras$.post_count_track.last_node_dir++;

        }

        _Cache['cpx_users'][user_id] = authorData;

        // @@ if this data should be operated on by this node 

        admin_report.report.post_count = admin_report.report.post_count || 0;
        admin_report.report.post_count++

        // @@ -- also check if the collection for this category was cached later 
        if (_id_array[5] == SqyDB.db_node) {

            _Cache[options.collection][data._id] = data;

            // let path_plus_item_id = config.db_data_dir + '/' + options.collection + '/' + _id_array[1].padStart(6, "0") + '/' + updatedDoc._id;
            let path_plus_item_id = config.db_data_dir + '/' + options.collection + '/' + _id_array[2] + '/' + data._id;

            SqyDB.fncs.queue_cache_persist({
                dir: config.db_data_dir,
                fnc: 'set_doc_to_disk',
                path_plus_item_id,
                admin_report,
                add_creator_connection: options.$extras && options.$extras.add_creator_connection ? options.$extras.add_creator_connection : null,
                authorData,
                postData: data,
                entityAuthorData

            })
            // return ''

        }




    } catch (error) {
        console.log(' error :: ---> ', error);
    }

}


db_fncs.after_create_entity = async function (data) {


    try {

        // connection_functions.after_create_entity();

        // _Cache['cpx_entity'][data._id];

        let type = data._fields.entity_type;
        let actorId = data.user_id || data.actorId

        if (_Cache['cpx_users'][actorId]) {

            _Cache['cpx_users'][actorId].$managing = _Cache['cpx_users'][actorId].$managing || {};
            _Cache['cpx_users'][actorId].$managing[data._id] = '-';
        };
        // console.log(' after post ran  :: ---> ', d );
        let options = {
            type,
            subjectId: data._id,
            actorId,
            dir: config.db_data_dir
        }

        if (type == "Page") {
            admin_report.report.pages_count = admin_report.report.pages_count || 0;
            admin_report.report.pages_count++
        }

        else {
            admin_report.report.groups_count = admin_report.report.groups_count || 0;
            admin_report.report.groups_count++
        }

        await connection_functions.linkup_with_entity(_Cache, _Connections, admin_report, options);



    } catch (error) {
        console.log(' error :: ---> ', error);
    }

}


db_fncs.after_complete_profile = async function (updatedDoc, options) {


    try {

        // connection_functions.after_create_entity();

        // _Cache['cpx_entity'][data._id];
        // @@ recache first

        let _id_array = updatedDoc._id.split('V');

        // console.log('_id_array --->>>>', _id_array, config.dbn_prefix);
        // @@ if this data should be operated on by this node 

        admin_report.report.users_count = admin_report.report.users_count || 0;
        admin_report.report.users_count++;

        // @@ -- also check if the collection for this category was cached later 
        if (_id_array[5] == SqyDB.db_node) {

            _Cache[options.collection][updatedDoc._id] = updatedDoc;

            // let path_plus_item_id = config.db_data_dir + '/' + options.collection + '/' + _id_array[1].padStart(6, "0") + '/' + updatedDoc._id;
            let path_plus_item_id = config.db_data_dir + '/' + options.collection + '/' + _id_array[2] + '/' + updatedDoc._id;

            SqyDB.fncs.queue_cache_persist({
                dir: config.db_data_dir,
                fnc: 'set_doc_to_disk',
                path_plus_item_id,
                data: updatedDoc,
                admin_report

            })
            // return ''

        }




    } catch (error) {
        console.log(' error :: ---> ', error);
    }

}


SqyDB.db_ops.unset = async function (options) {
    // return await _unset(options)

    let _id = options._id || (options.$where && options.$where._id);

    // console.log('The great Resetter --===---><>>>>>>> _id :: ', _id, options.collection, 'options :: ->', options );

    if (typeof _id == 'string') {

        //    return await get_one_by_id(_id, options, _Cache, _CacheIndex);
        // let res_ = await SqyDB.db_ops.get(options);


        // console.log('317 The great Resetter --===---><>>>>>>> _id :: ', "_doc, options.data ", res_, '\n options ---->', options );


        let key = _CacheIndex[options.collection]['_id'][_id];

        console.log('unset options :: -->', options, '\n key -->', key);

        // return { msg: 'working' }

        // console.log('a --->  k  --->', options.$updateAuthorization.check.$creator,  res_.doc.$creator$ );
        // --
        // Use maps instead of array for Sorts later
        // map serves as sorter plus indexer since ther's order

        if (typeof key == 'string') {

            let cData = _Cache[options.collection][key];

            if (cData && cData._id) {

                // @@ Doc Auth first ---- 
                if (options.$updateAuthorization && options.$updateAuthorization.check) {

                    if (options.$updateAuthorization.check.$creator !== cData.$creator$) {
                        return { msg: 'authorized' }
                    }
                }

                // @@ delete ops
                // remove from index
                delete _CacheIndex[options.collection]['_id'][_id];

                // @@ delete from others too...
                // console.log('Delete options :: -->', options);

                // nullify collection cache
                // -- increase coll count --- 
                _CacheStats[options.collection].last_num++;


                // @@ remove from cache ---
                delete _Cache[options.collection][key];

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

SqyDB.fncs.unlink_doc = async function (_id, options) {


    // let _id = SqyDB_stats[options.collection].last_num + 'V' + SqyDB_stats[options.collection].last_node_dir + 'V' + _u.gen_id() + 'V' + config.dbn_prefix + 'V' + SqyDB.db_node;
    // num in folder / last node dir / id / db host / db_node
    // console.log('Persist time --->', updatedDoc );

    // @@ analyze updatedDoc._id to know where to Cache data
    let _id_array = _id.split('V');

    // console.log('_id_array --->>>>', _id_array, config.dbn_prefix);

    // @@ if this data should be operated on by this node 
    // @@ -- also check if the collection for this category was cached later 
    if (_id_array[5] == SqyDB.db_node) {

        // SqyDB_Cache[options.collection][updatedDoc._id] = updatedDoc;

        // let path_plus_item_id = config.db_data_dir + '/' + options.collection + '/' + _id_array[1].padStart(6, "0") + '/' + _id;
        let path_plus_item_id = config.db_data_dir + '/' + options.collection + '/' + _id_array[2] + '/' + _id;

        SqyDB.fncs.queue_cache_persist({
            fnc: 'unset_doc_form_disk',
            path_plus_item_id,
        })

        // const path = "/path/to/file.txt";
        // await unlink(`${path_plus_item_id}.json`);
        // return ''
        return { msg: 'OK' }
    }
    else {

        // @@ make a request to the appropriaet node for a cache update

    }

};

const get_one_by_id = async function (_id, options) {

    /* 
    * @@ 1. Get the doc with the supplied _id or all if no _id is supplied 
    **/

    // * @@ 1. Get by ID from Cache 
    let doc1 = _Cache[options.collection][_id];
    let check_connection_result = {};


    let $join = options['$join'];
    let run_join = false;

    // console.log('--====---> listDocuments for', 'options', _CacheKeys[options.collection], '\n skip :: ->', skip );
    if (typeof $join == 'object' && $join &&
        typeof $join.collection !== 'undefined' &&
        config.join_collection_map && typeof $join.id_key !== 'undefined' &&
        _Cache[config.join_collection_map[$join.collection]]
    ) {
        run_join = true;
    }

    let data_x = {}

    if (doc1 && doc1._id) {

        // data_x = doc1;
        if (doc1._fields && doc1._fields.fullname) {
            doc1._fields.fullname = `${doc1._fields.lastname} ${doc1._fields.firstname} ${doc1._fields.middleName}`;
        }

        if (!options.forAuth) {

            let { $creator$, $last_edited_on$, $password$, $last_edited_by$, $t$, role, $uid$, ...dataToUse } = doc1;
            data_x = dataToUse;

        }

        else { data_x = doc1; }

        // --- check connection
        // console.log(' 000 check ---> $$ :: --->>', 'check_key', options, 'join_val ::', join_val, _Cache[config.join_collection_map[$join.collection]][join_val] );

        // --- check connection
        if (run_join) {

            let join_val = value_from_key_depth($join.id_key, doc1);

            if (join_val !== "$null") {

                let data_y = {};

                // let join_keys = Object.keys(options['$join']);
                let join_data = _Cache[config.join_collection_map[$join.collection]][join_val];





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

                        let { $otp, $creator$, $last_edited_on$, $password$, $last_edited_by$, $t$, role, $uid$, ...dataToUse } = join_data;
                        data_y = dataToUse;
                    }

                    data_x.$join = data_y;

                }
            }

        }

        // console.log(' \n \n 561 after sign in ', options, _Cache['cpx_users']['11997V1VQ2K0f2s6P7K420S0I4Vh1V1']  );

        return { msg: 'OK', doc: data_x }
    }

    // @@ else check across the cluster
    // -- smart checking via _id analyzing
    // -- return null for now
    return { msg: 'NULL' }



}


SqyDB.db_ops.fetch_user_group_joined_and_pages_managing = async function (options) {

    if (!options.user_id) {
        return { error: 'Missing User ID' }
    }
    options.$managing = options.$managing || {};
    let groups_user_joined = _Connections['groups_user_joined'][options.user_id];
    let results = [];

    if (groups_user_joined) {
        options.$managing = { ...options.$managing, ...groups_user_joined };
    }

    // console.log('$managing :: -> ', options.$managing );

    for (const key in options.$managing) {

        // if (Object.prototype.hasOwnProperty.call(object, key)) {
        //     const element = object[key];
        // }
        // let entity_id = options.$managing[key];

        const dd = _Cache['cpx_entity'][key];

        if (dd && dd._id) {

            const { entity_type, title, displayPhoto } = dd._fields;
            results.push({
                _id: dd._id,
                _fields: {
                    displayPhoto,
                    entity_type,
                    title
                }
            })
        }

    }

    return { msg: 'OK', results }


};

// @@ Collections in chronological or reverse chron order
SqyDB.db_ops.get_items_with_connections = async function (options) {


    // console.log(' get_items_with_connections =====================-=====-==-->', options );
    options.collection = options.coll;

    if (options.type == 'admin_report') {

        return { msg: 'OK', data: admin_report.report }

    }

    if (!options?.$where?._id) {
        return { error: 'Missing ID' }
    }

    if (!options?.collection) {
        return { error: 'Missing collection' }
    }

    let d = _Cache[options.collection][options.$where._id];

    let { $otp, $extras$, $last_edited_on$, $password$, $last_edited_by$, $t$, role, $uid$, ...dataToReturn } = d;

    if (!dataToReturn) {
        return { error: 'Null' }
    }

    dataToReturn.hasLiked = false;

    if (options.type == 'post') {

        dataToReturn.hasLiked = _Connections['post_likes'] && typeof _Connections['post_likes'][dataToReturn._id] !== 'undefined' && typeof _Connections['post_likes'][dataToReturn._id][options.user_id] == 'string' ? true : false;

        // @@ check if I'm following the author
        // let isFollowing = _Connections['users_followers'] && typeof _Connections['users_followers'][curr_profile_data._id] !== 'undefined' && typeof _Connections['users_followers'][curr_profile_data._id][user_id] == 'string' ? true : false;
    }

    if (options.type == 'user') {

        dataToReturn.isFollowing = _Connections['users_followers'] && typeof _Connections['users_followers'][dataToReturn._id] !== 'undefined' && typeof _Connections['users_followers'][dataToReturn._id][options.user_id] == 'string' ? true : false;

        // @@ check if I'm following the author
        // let isFollowing = 
    }

    if (options.type == 'entity') {

        dataToReturn.hasFollowed = _Connections['entity_linkup'] && typeof _Connections['entity_linkup'][dataToReturn._id] !== 'undefined' && typeof _Connections['entity_linkup'][dataToReturn._id][options.user_id] == 'string' ? true : false;
        // let isMember = typeof _Connections['$group_members'][curr_entity_data._id] !== 'undefined' && typeof _Connections['$group_members'][curr_entity_data._id][user_id] == 'string' ? true : false;
        dataToReturn.isMember = false;

        if (dataToReturn.hasFollowed) {
            dataToReturn.isMember = dataToReturn._fields.entity_type == 'Group' ? true : false;
        }

        // @@ check if I'm following the author
        // let isFollowing = 
    }

    // console.log(' options :: ---> ', options, dataToReturn, ' \n \n :: --->>> ', _Cache[options.collection][options.$where._id] );

    return { msg: 'OK', data: dataToReturn }

};


// @@ Collections in chronological or reverse chron order
SqyDB.db_ops.listDocuments = async function (options) {

    // console.log('-->>>>>>>>>>>>>>>>>>>>====---> DB 875, getting Docs', options, "_CacheIndex['cpx_posts']['_id']");

    let documents = [];

    // let user_id = options.$where.author;



    let skip = options.$skip;
    let postLimit = options.$limit || 10;
    let endPost = 0;

    let lDocs = _CacheKeys[options.collection].length; //_Cache[options.collection].size;

    let $join = options['$join'];
    let run_join = false;
    let found = false;


    if (typeof $join == 'object' && $join &&
        typeof $join.collection !== 'undefined' &&
        config.join_collection_map && typeof $join.id_key !== 'undefined' &&
        _Cache[config.join_collection_map[$join.collection]]
    ) {
        run_join = true;
    }


    // let kk = _CacheKeys[options.collection][2];

    // if (kk && kk._id) {
    //     console.log(' vkkk ---->', _Cache[options.collection][kk._id] )
    // }
    // console.log('$join :: ---->', run_join, options, ' \n coll count -->', lDocs, 'kk -> :: ---->', 'kk');

    // console.log( ' --====---> listDocuments for', 'options', _CacheKeys[options.collection], '\n skip :: ->', skip, options );
    // _Cache

    // for(i = 0; i < array.length; i++){
    //     // do something with array[i]
    // }

    // // you go backwards:
    // for(i = array.length - 1; i >= 0; i--){
    //     // do something with array[i]
    // }

    for (let index = 0; index < lDocs; index++) {
        // for ( let index = lDocs - 1; index >= 0; index-- ) {    
        // https://stackoverflow.com/questions/69839020/how-do-i-loop-through-an-array-backwards

        if (endPost == postLimit) { break; }

        if (found && (!options.$limit || options.$limit <= 1)) { break; }

        if (index >= skip && endPost <= postLimit) {

            let key = _CacheKeys[options.collection][index];
            // let key = _CacheIndex[options.collection]['_id'][_id];
            // console.log('--====---> listing for', 'options key._id', key._id, ' \n options :: ->', options, _CacheIndex[options.collection]['_id'][key._id] );

            // @@ skip deleted items 
            // if ( key._id == '$deleted') { continue; }
            if (!_CacheIndex[options.collection]['_id'][key._id]) { continue; }

            // let post_id = _CacheIndex['cpx_posts']['_id'][key];
            // let post_id = _CacheIndex['cpx_posts']['_id'][key._id];
            let cData = _Cache[options.collection][key._id];
            // let isUserPost = options.author_type == 'profile' ?
            // curr_post_data.postAuthor.authorId : curr_post_data.postEntity._id;

            // console.log(' cData >>>>>>>>>>>>>. ->', cData );

            // if (options.collection == 'LSSB_applications' && cData._fields.applicant_id ) {
            //     const dd1_ = _Cache['LSSB_users'][cData._fields.applicant_id];

            //     // console.log(' dd1_ dd1_  >>>>>>>>>>>>>. ->', dd1_ );

            //     cData._fields.applicant_fullname =  `${dd1_?._fields.lastname} ${dd1_?._fields.firstname} ${dd1_?._fields.middleName}`;
            // }

            // console.log('--====---> getting feed 0', user_id, curr_post_data._id, _CacheIndex['$postLikes']['_id'][curr_post_data._id][user_id]  );

            // console.log(' >>> --====---> DDDDDD >>>>>>> ',  options  );

            let data_x = {}
            // if (curr_post_data && isUserPost == user_id) {
            if (cData) {

                let ddx_ = {};

                if (options.$join && options.$where && options.$where["_fields.sex"]) {

                    let j_data = _Cache['LSSB_users'][cData._fields.applicant_id];

                    if (j_data) {

                        ddx_ = { ...cData };
                        ddx_._fields.sex = j_data._fields.sex;
                    }
                }
                else {
                    ddx_ = cData
                }

                // @@ run filters
                let res_ = filter_engine(ddx_, options);

                // console.log(' \n \n \n res_ 0 ---- >>>', res_ );
                ddx_ = null;

                if (res_.status == 'true') {


                    found = true;

                    // let hasLiked = typeof _CacheIndex['$postLikes']['_id'][curr_post_data._id] !== 'undefined' && typeof _CacheIndex['$postLikes']['_id'][curr_post_data._id][user_id] == 'string' ? true : false;
                    // curr_post_data.hasLiked = hasLiked;
                    // let curr_post_data = res_.data;
                    // res_ = null;
                    // if (curr_post_data && curr_post_data.attr && !curr_post_data.attr.is_media_post) {
                    // @@  -- joining from others coll
                    // let join_val = value_from_key_depth($join.id_key, curr_post_data);
                    data_x = res_.data;
                    // console.log(' 000 check ---> $$ :: --->>', 'check_key', options, 'join_val ::', join_val, _Cache[config.join_collection_map[$join.collection]][join_val] );
                    let $joiner;
                    // --- check connection
                    if (run_join) {

                        let join_val = value_from_key_depth($join.id_key, res_.data);

                        // console.log(' 980 $$c-------->> join_val', join_val,  );
                        // console.log(' $$0000-------->> koko', config.join_collection_map  );

                        if (join_val !== "$null") {

                            let useJoinD = {};
                            // let join_keys = Object.keys(options['$join']);
                            let join_data = _Cache[config.join_collection_map[$join.collection]][join_val];

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
                                    let { $otp, $creator$, $extras$, $last_edited_on$, $password$, $last_edited_by$, $t$, role, $uid$, ...dataToUse } = join_data;

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

                        let { $otp, $creator$, $extras$, $last_edited_on$, $password$, $last_edited_by$, $t$, role, $uid$, ...dataToUse } = res_.data;
                        data_x = dataToUse;

                        // if (data_x._fields && data_x._fields.password) {
                        //     // data_x._fields.password = '#ENCRYPTED#';
                        // }

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



                    // if (data_x._fields && data_x._fields.password) {
                    //     data_x._fields.password = '#ENCRYPTED#';
                    // }

                    if (data_x._fields && data_x._fields.fullname && data_x._fields.lastname) {
                        data_x._fields.fullname = `${data_x._fields.lastname} ${data_x._fields.firstname} ${data_x._fields.middleName}`;
                    }

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

    // console.log('--====---> Store :: ', _CacheIndex['cross_store'] );

    // console.log('--====---> listDocuments for', 'options', _CacheKeys[options.collection], '\n skip :: ->', skip, documents );
    // return { documents, count: i, limit, skipped: skip }
    return { status: 'OK', documents }

};


SqyDB.db_ops.get = async function (options) {

    // let file = Bun.file('/Applications/MAMP/htdocs/SqyDB_deploy/../_d_data/cpUser/002/0008h1j6n8w5a5o70011987.json');
    // const doc = await file.json();
    // @@ e.g listDocuments
    if (options.db_fn && typeof SqyDB.db_ops[options.db_fn] == 'function') {

        return await SqyDB.db_ops[options.db_fn](options);
    }

    /* 
     * @@ 1. Get the doc with the supplied _id or all if no _id is supplied 
     **/
    // let dataPool = _cache[options.config][options.collection]; 

    // console.log('getet 90 ===::m===:: -----<<>>>>>', options, _CacheIndex['cpFeeds'], !options.$where && !options.$where_not && !options.$search  );

    // @@ get many no filters added
    if (!options.$where && !options.$where_not && !options.$search) {

        // @@ proceed to $query filters 
        // return await get_docs_by_query(options);
        return await SqyDB.db_ops.listDocuments(options);
    }

    // console.log('get ing cpFeedo ===::m===:: -----<<>>>>>', options, _CacheIndex['cpFeeds'], !options.$where && !options.$where_not && !options.$search  );

    // * @@ 1. Get the _id 
    let _id = options._id || (options.$where && options.$where._id);

    // let _id = options.$where._id; //._id ? options._id : (options.$where && options.$where._id || 'null');

    // console.log('get ing cpFeedo ===::m===:: -----<<>>>>>', options, '_id _id ---:: -->', _id._id );

    if (typeof _id == 'string') {

        return await get_one_by_id(_id, options);
    }

    // @@ proceed to $query filters 

    // return await get_docs_by_query(options);
    return await SqyDB.db_ops.listDocuments(options);

    // return await _get(options, _Cache, _CacheIndex, _CacheStats);

};


SqyDB.fncs.run_update_on_data = async function (_doc, update_data) {



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
                if (typeof _u.data_v_to_check_with(k, _doc) == 'undefined') {

                    let _aa = k.split('.');
                    if (_aa.length == 1) {
                        _doc[k] = [];
                    }

                    if (_aa.length == 2) {
                        _doc[_aa[0]][_aa[1]] = [];
                    }

                }

                if (typeof _u.data_v_to_check_with(k, _doc) == 'object'
                    && typeof _u.data_v_to_check_with(k, _doc).length == 'number') {

                    // console.log(' 0 --->', update_data[k] );
                    // @@ ops -- 0 -- 0 - 0 - ;

                    // -- push into arrays
                    if (update_data[k][0] == '__push') {

                        let _aa = k.split('.');
                        let _md = _aa.length > 1 ? _doc[_aa[0]][_aa[1]] : _doc[k];

                        update_data[k].forEach((item, i) => {
                            // skip first being push
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


                    // @@ update index with K's new vale
                    // _CacheStats[options.collection].collection_index.forEach(indx => {

                    //     // if ( options.data[indx] && _CacheIndex[options.collection][indx]) {
                    //     // if (indx == '_id' && value_from_key_depth(indx, options.data) !== '$null' && _CacheIndex[options.collection][indx]) {
                    //     //     _CacheIndex[options.collection][indx][options.data[indx]] = options.data._id;
                    //     // }

                    //     let v = value_from_key_depth(indx, options.data);

                    //     // if ( v !== '$null') {
                    //     //     _CacheIndex[options.collection][v] = options.data._id;
                    //     // }

                    //     if (indx !== '_id' && v !== '$null') {
                    //         _CacheIndex[options.collection]['others'][v] = options.data._id;
                    //     }

                    // })

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

            _u.which_doc_key_to_set(k, _doc, update_data);

        }

    });

    // @@ or add 

    return _doc

}

// @@ run query using listDocs and reset results with data
// @@ won't be needed for now
SqyDB.db_ops.reset_using_query = async function (options) { }

// @@ for LSSB
SqyDB.db_ops.run_batch = async function (options) {


    // console.log(' run_batch ---- === ---- >>> running batch --->', options.update_type, options.data[0]);

    let persist_batch_data = [];
    if (options.update_type == 'indigeneship' || options.update_type == 'studentship' || options.update_type == 'studentship_and_indigeneship') {

        // @@ ---- 
        options.data.forEach(each_data => {

            let _id = each_data.Applicant_Id;

            // _Cache['LSSB_users'][_id]._academic_criteria.studentship_status = each_data.Studentship;
            // console.log('_id && _Cache[\'LSSB_users\'][_id] --->', _id && _Cache['LSSB_users'][_id], _id );

            if (_id && _Cache['LSSB_users'][_id] && (options.update_type == 'studentship' || options.type == 'studentship_and_indigeneship')) {

                _Cache['LSSB_users'][_id]._academic_criteria = _Cache['LSSB_users'][_id]._academic_criteria || {};

                _Cache['LSSB_users'][_id]._academic_criteria.studentship_status = each_data.Studentship;

                persist_batch_data.push({
                    _id,
                    collection: 'LSSB_users',
                    key: '_academic_criteria',
                    value: _Cache['LSSB_users'][_id]._academic_criteria
                });

            }

            if (_id && _Cache['LSSB_users'][_id] && (options.update_type == 'indigeneship' || options.type == 'studentship_and_indigeneship')) {

                _Cache['LSSB_users'][_id]._academic_criteria = _Cache['LSSB_users'][_id]._academic_criteria || {};

                _Cache['LSSB_users'][_id]._academic_criteria.indigeneship_status = each_data.Indigeneship;

                persist_batch_data.push({
                    _id,
                    collection: 'LSSB_users',
                    key: '_academic_criteria',
                    value: _Cache['LSSB_users'][_id]._academic_criteria
                });

            }

        })


        // @@ persist  ---- 
        const persistWorker = new Worker("/var/www/LSSB_Deploy/SqyDB_deploy/db_worker.js", {
            smol: true,
        });

        persistWorker.postMessage({

            fnc: 'persist_batch_fnc',
            batch: persist_batch_data,
            dir: config.db_data_dir

        });





    }


    return { msg: 'OK' }
}

SqyDB.db_ops.reset = async function (options) {

    // return await _reset(options, _Cache, _CacheIndex, _CacheStats)
    let _id = options._id || (options.$where && options.$where._id);

    // @@ so it adds $UID$ et al
    options.forAuth = true;
    // options.forReset = true;

    // console.log('The great Resetter --===---><>>>>>>> _id :: ', _id, options.collection, 'options :: ->', options );

    if (typeof _id == 'string') {

        //    return await get_one_by_id(_id, options, _Cache, _CacheIndex);
        // options.forAuth = true;
        let res_ = await SqyDB.db_ops.get(options);


        if (res_ && res_.doc && res_.doc._id) {

            // console.log(' ---> update 00 :: -->', '.$creator$', '\n -->', options,  res_.doc );

            // console.log(' ---> update 00 :: -->', options.$updateAuthorization, options.$updateAuthorization.check.$creator, res_.doc.$creator$, '\n -->', 'options' );

            // @@ Doc Auth first ---- 
            if (options.$updateAuthorization && options.$updateAuthorization.check) {

                if (options.$updateAuthorization.check.$creator !== res_.doc.$creator$) {
                    return { msg: 'authorized' }
                }
            }

            // @@ never update ID
            delete options.data._id;

            let updatedDoc = await SqyDB.fncs.run_update_on_data(res_.doc, options.data);
            // let returnValues = {};

            // @@ your after reset fnc should update and cache o
            if (options.$afterResetFnc && typeof db_fncs[options.$afterResetFnc] == 'function') {

                db_fncs[options.$afterResetFnc](updatedDoc, options);
            }

            else {
                SqyDB.fncs.reCache_and_persist_updated_doc(updatedDoc, options);
            }


            return { msg: 'OK', updatedDoc }
        }

        return { msg: 'Docs not found' }

    }


    return { msg: 'Missing ID' }


};


// @@ re-cache

SqyDB.fncs.reCache_and_persist_updated_doc = async function (updatedDoc, options) {


    // let _id = _CacheStats[options.collection].last_num + 'V' + _CacheStats[options.collection].last_node_dir + 'V' + _u.gen_id() + 'V' + config.dbn_prefix + 'V' + SqyDB.db_node;
    // num in folder / last node dir / id / db host / db_node
    // console.log('Persist time --->', updatedDoc );

    // @@ analyze updatedDoc._id to know where to Cache data
    let _id_array = updatedDoc._id.split('V');

    // console.log('_id_array --->>>>', _id_array, config.dbn_prefix);
    // @@ if this data should be operated on by this node 

    // @@ -- also check if the collection for this category was cached later 
    if (_id_array[5] == SqyDB.db_node) {

        _Cache[options.collection][updatedDoc._id] = updatedDoc;

        // let path_plus_item_id = config.db_data_dir + '/' + options.collection + '/' + _id_array[1].padStart(6, "0") + '/' + updatedDoc._id;
        let path_plus_item_id = config.db_data_dir + '/' + options.collection + '/' + _id_array[2] + '/' + updatedDoc._id;

        SqyDB.fncs.queue_cache_persist({
            fnc: 'set_doc_to_disk',
            path_plus_item_id,
            data: updatedDoc
        })
        // return ''

    }

    // @@ GoRoutine Version
    else {
        // @@ make a request to the appropriaet node for a cache update
    }

};

SqyDB.fncs.queue_cache_persist = async function (options_) {

    // console.log('Time to Cache and persist. ---=>', options_.path_plus_item_id);

    // @@ quickly experiment write

    /**   
    * @@ -- Persist worket Set OPs
    * @@ -- Yay
    */

    const persistWorker = new Worker("/var/www/LSSB_Deploy/SqyDB_deploy/db_worker.js", {
        smol: true,
    });

    // persistWorker.postMessage(queueOne);
    persistWorker.postMessage(options_);


};


SqyDB.db_ops.check_exists = async function (options) {

    let where_key = Object.keys(options.$where)[0];
    let where_val = options.$where[where_key];

    // console.log(' w$$$$$$ --===>', options.$where, where_key, options.collection, _CacheIndex[options.collection], where_val )

    if (_CacheStats[options.collection].collection_index.indexOf(where_key) > -1) {

        // search acros nodes and clusters
        if (where_key == '_id') {

            if (options.$return_data) {

                return {
                    msg: true,
                    _id: _CacheIndex[options.collection]._id[where_val],
                    // data: _Cache[options.collection].get(_id)
                    data: _Cache[options.collection][_id]
                }
            }

            return { msg: _CacheIndex[options.collection]['_id'].hasOwnProperty(where_val), _id: _CacheIndex[options.collection]._id[where_val] }
        }

        let res_exists = _CacheIndex[options.collection]['others'].hasOwnProperty(where_val);
        let _id = _CacheIndex[options.collection]['others'][where_val];

        // console.log('res_exists :: -->', res_exists, options.$return_data , where_val, _id, _Cache[options.collection][res_exists] )

        if (res_exists) {


            if (options.$return_data) {

                return {
                    msg: true,
                    _id: _CacheIndex[options.collection].others[where_val],
                    // data: _Cache[options.collection].get(_id)
                    data: _Cache[options.collection][_id]
                }
            }

            return { msg: true, _id: _CacheIndex[options.collection].others[where_val] }
        }

        return { msg: false }


    }

    // @@ false or device a means to search across clusters
    return { msg: false }

    // return await _check_exists(options, _Cache, _CacheIndex, _);

};



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

    //     _CacheIndex[options_.collection] = _CacheIndex[options_.collection] || { _id: {} };

    //     return 'OK'
    // }

    if (!_CacheStats[options_.collection]) {

        // _CacheStats[options_.collection] = _CacheStats[options_.collection] || { last_num: config.db_node_limit + 1, last_node_dir: 1 };

        _CacheStats[options_.collection] = _CacheStats[options_.collection] || { last_num: config.db_node_limit + 1, last_node_dir: 1, collection_index: [] };

        // @@ -- Indexes --- add more from config here 
        if (config.collection_index && config.collection_index[options_.collection]) {
            _CacheStats[options_.collection].collection_index = ['_id', ...config.collection_index[options_.collection]]
        }

        _CacheIndex[options_.collection] = _CacheIndex[options_.collection] || { _id: {}, others: {} };

        _CacheKeys[options_.collection] = _CacheKeys[options_.collection] || {};


        _Cache[options_.collection] = _Cache[options_.collection] || {};

        let this_col_index = ['_id'];
        if (config.collection_index && config.collection_index[options_.collection]) {
            this_col_index = ['_id', ...config.collection_index[options_.collection]]
        }

        // console.log(' this_col_index -===>', this_col_index );
        _CacheStats[options_.collection].collection_index = this_col_index;

    }

    // console.log( ' sending to worker Working', ' SqyDB.connect.worker :: ---> ' );
    const persistWorker = new Worker("/var/www/LSSB_Deploy/SqyDB_deploy/db_worker.js", {
        smol: true,
    });

    persistWorker.postMessage({

        fnc: 'check_or_setup_collection',
        collection: options_.collection,
        clientId: options_.clientId,
        config,
        inDir: config.db_data_dir

    });

    // }

    // {

    //         work_type: 'check_or_setup_collection',
    //         clientId: options_.clientId,
    //         collection: options_.collection,
    //         inDir: config.db_data_dir

    //     })


    return 'OK'

    // console.log(' initialize_DBs done -->', (Date.now() - startTime) / 1000, 'seconds');


}


SqyDB.load_cache_from_disk = async function () {

    let _options = {
        node: `${Bun.argv[Bun.argv.indexOf('--node') + 1]}`,
        config,
        // inDir: config.db_data_dir
    },

        startTime = Date.now();

    const done_fnc = function () {

        // console.log('done_fnc :: -->', _Cache );
        SqyDB.isReady = true;
        // console.log(' 00 done_fnc :: -->', '_Cache', _CacheIndex, '_CacheStats', '\n in ->', (Date.now() - startTime) / 1000, 's');

        // console.log( 

        //     ' _Cache ', Array.from(_Cache['cpx_users'].keys()) 

        // );

        console.log(

            // ' _Cache connect :: ->', _Connections,
            ' _Cache connect :: ->', 'kk',
            // '\n admin_report ::  --> ', admin_report,
            // '_CacheIndex ----> ', _CacheIndex['LSSB_applications'],
            // '_CacheIndex ----> ', _CacheIndex['LSSB_admin'],
            // '_CacheIndex ----> ', _CacheIndex['LSSB_users'].others['olagbenderebecca@yahoo.com'],
            // '\n _ cchhhhhh _Cache :: ->', _Cache['cpx_users']["USV99V1Vp4u0q1R1K3N7p7u6J1Vh1V1"],
            // '\n _ cchhhhhh _Cache :: ->', _Cache['LSSB_admin'], Object.keys(_Cache),
            // '\n in ->', (Date.now() - startTime) / 1000, 's'

        );



        // Object.keys()
    }

    // setTimeout( function() {

    // console.log(' 00 done_fnc :: -->', '_Cache', _CacheIndex, _CacheStats, '\n in ->', (Date.now() - startTime) / 1000, 's');

    // }, 2300)

    // let scan_coll_res = await scan_disk_to_cache(_Cache, SdbConnections, _options, done_fnc );
    scan_disk_to_cache(admin_report, _Cache, _CacheKeys, _CacheIndex, _CacheStats, _Connections, _commentsCache, _commentsIndex, _options, done_fnc);


};

SqyDB.create_extra_collections = function () {

    // let additional_collections = ['_connections', "_comments", '_chats'];
    create_extra_collections(config);

};

SqyDB.start = function () {


    try {

        SqyDB.node_num = parseInt(Bun.argv[Bun.argv.indexOf('--node') + 1]);

        SqyDB.open_connection_interface();

        // @@ load Cache after opening connection
        SqyDB.load_cache_from_disk();

        SqyDB.create_extra_collections();

        // @@ setup worker connection
        // SqyDB.setup_worker_connection();

        // console.log('db dir --', config.db_data_dir );

    } catch (error) {


        console.error(error);

    }

}


SqyDB.open_connection_interface = function () {

    let node_arg = Bun.argv[Bun.argv.indexOf('--node') + 1];

    console.log(` Conection to DB Server Open ${node_arg} --> `, config.db_port + (parseInt(node_arg) - 1));
    SqyDB.db_node = node_arg;

    const server = Bun.serve({

        port: config.db_port + (parseInt(node_arg) - 1),

        async fetch(req) {

            let payLoad = await req.json();

            // console.log('DB payLoad >>>> ', payLoad );

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

            return new Response(
                // JSON.stringify( { db_fnc_response: payLoad.db_fnc, response: db_fnc_res }),
                JSON.stringify({ db_action_response: payLoad.db_action, response: 'Invalid Action' }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    status: 200
                }
            );

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


SqyDB.start();