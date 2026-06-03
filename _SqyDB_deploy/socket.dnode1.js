
const { config } = await import('./_config.js');

const { _set } = await import('./_lib_/_set.js');

const { _u } = await import('./_lib_/_u.js');

const { scan_and_cache_collections } = await import('./_lib_/scan_and_cache_collections.js');

const { _reset } = await import('./_lib_/_reset.js');

const { _unset } = await import('./_lib_/_unset.js');

const SqyDB = {};

let SqyDB_stats = {};

let SqyDB_Cache = {};

let SqyDB_index = { _id: {} };

SqyDB.db_ops = {};

SqyDB.fncs = {};

SqyDB.is_caching = false;

SqyDB.isWorking = false;

SqyDB.db_ready = false;

// @@ attache socket here
SqyDB.connect = { cache: {}, worker: {} };

SqyDB.connection_state = {};


let SqyDB_Worker_Queue = {};





// @@ Set --- 
let set_hit = 0;

SqyDB.db_ops.set = async function (options) {

    try {

        set_hit++;
        console.log('set hit -=====>', set_hit );

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
        // -- if it's 3000th num we move to the next node folder and start from 1
        SqyDB_stats[options.collection].last_num--;

        if (SqyDB_stats[options.collection].last_num === 0) {
            SqyDB_stats[options.collection].last_num = 3000;
            SqyDB_stats[options.collection].last_node_dir++;
        }


        // last_num = last_num == config.db_doc_limit ? 0 : last_num + 1;
        // last_node_dir = last_num == config.db_doc_limit ? last_node_dir + 1 : last_node_dir;

        // "dn10001z1b7D0O7T9p1u2O2m115o4p558001"

        // let _last_node_dir = _u.preceeder_(SqyDB_stats[this_collection].last_node_dir, 5);

        // let _id = config.dbn_prefix + _u.preceeder_(last_num, 4) + gen_id().substring(0, 12) + _last_node_dir;

        let _id = '';

        function check_id() {

            // let _id = dbn_prefix + _u.preceeder_(last_num, 4) + _u.gen_id() + _last_node_dir;
            // if () {}
            // Num in folder / node folder / id / host id = dbn_prefix /  node on host
            let _id = SqyDB_stats[options.collection].last_num + 'V' + SqyDB_stats[options.collection].last_node_dir + 'V' + _u.gen_id() + 'V' + config.dbn_prefix + 'V' + SqyDB.db_node;

            if (SqyDB_index._id[options.collection][_id]) {

                _id = check_id(_id)
            }
            else {
                return _id;
            }

        };

        _id = check_id();

        // @@ set data id
        options.data._id = _id;

        // @@ set time
        options.data['$t$'] = Date.now();

        // console.log( ' in _set -----> now setting ---> ', options.data, 'gen_id()' );

        // return { _id: 'hfyht6uijhbhh909', msg: 'OK' }

        // let path_plus_item_id = config.db_data_dir + '/' + options.collection + '/' + _u.preceeder_(SqyDB_stats[options.collection].last_node_dir, 5) + '/' + _id;
        let path_plus_item_id = config.db_data_dir + '/' + options.collection + '/' + (""+SqyDB_stats[options.collection].last_node_dir).padStart(6, "0") + '/' + _id;

        console.log('in _set --- Time to cache and persist -->>>>', {
            path_plus_item_id,
            data: options.data
        })

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











const cache9 = {
    'dn10001f117e0s7C6O7l3q662X351P7K2001': {
        "email": "wakex80806@syinxun.com",
        "username": "theBetman",
        "password": "12",
        "confirm_password": "12",
        "_id": "dn10001f117e0s7C6O7l3q662X351P7K2001"
    }
}

SqyDB.db_ops.get = async function (options) {

    // let file = Bun.file('/Applications/MAMP/htdocs/SqyDB_deploy/../_d_data/cpUser/001/dn10001f117e0s7C6O7l3q662X351P7K2001.json');
    let file = Bun.file('/Applications/MAMP/htdocs/SqyDB_deploy/../_d_data/cpUser/002/0008h1j6n8w5a5o70011987.json');
    const doc = await file.json();

    // console.log('doc doc doc -->', doc );
    return doc

    // return await _set(options)
    return cache9["dn10001f117e0s7C6O7l3q662X351P7K2001"]

};

SqyDB.db_ops.reset = async function (options) {
    return await _reset(options)
};

SqyDB.db_ops.unset = async function (options) {
    return await _unset(options)
};

SqyDB.fncs.send_queue_to_worker_for_persisting = async function () {

     // @@ ---- Send Queue to worker for prsist job
     if ( !SqyDB.isWorking ) {

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

SqyDB.fncs.queue_cache_persist = async function (options_) {

    // console.log('Time to Cache and persist. ---=>', options_);

    // @@ quickly experiment write
    options_.data = JSON.stringify(options_.data);

    // SqyDB_Worker_Queue[`${options_.data._id}_set_${Date.now()}`] = options_;
    // await Bun.write(options_.path_plus_item_id + '.json', options_.data);
    const bytes = await Bun.write(options_.path_plus_item_id + '.json', options_.data);

    // await SqyDB.fncs.send_queue_to_worker_for_persisting();


    // console.log('data persisted. ---=>', bytes);

};

SqyDB.open_connection_interface = function () {

    let node_arg = Bun.argv[Bun.argv.indexOf('--node') + 1]
    console.log(` Initialize DB Socket Server ${node_arg} --> `, config.db_port + (parseInt(node_arg) - 1));
    SqyDB.db_node = node_arg;

    Bun.serve({
        port: config.db_port + (parseInt(node_arg) - 1),
        fetch(req, server) {
            // upgrade the request to a WebSocket

            const success = server.upgrade(req, {
                // Set username to semi-random text, collisions probably do not use in production
                // data: { username: "user_" + Math.random().toString(16).slice(12) },
                data: { con_count: 0 }
            });

            // console.log(' Sock server running ---->>', data);

            return success
                ? undefined
                : new Response("Upgrade failed :(", { status: 500 });
        },
        websocket: {

            open(ws) {
                // Store username
                // users.push(ws.data.username);

                // SqyDB.connect.cache = ws;
                // console.log(' A new connection hit this DB node ---->>', 'ws');

                // Subscribe to pubsub channel to send/receive broadcasted messages,
                // without this the socket could not send events to other clients
                // ws.subscribe("chat");


                ws.send(JSON.stringify({ type: "DB_initialized", user: ws.data.con_count }));
                // ws.send(JSON.stringify({ type: "MESSAGES_SET", data: messages }));

            },
            async message(ws, options) {

                const payLoad = JSON.parse(options);

                console.log('DD Node Sock message ::: -----===> ', payLoad );

                ws.data.clientId = payLoad.clientId;

                // if (payLoad.type == 'setup_client_id') {
                //     ws.data.clientId = payLoad.clientId;
                // }

                if (payLoad.db_fnc && typeof SqyDB.fncs[payLoad.db_fnc] == 'function') {

                    ws.data.clientId = payLoad.clientId;

                    let db_fnc_res = await SqyDB.fncs[payLoad.db_fnc](payLoad);

                    console.log('db_fnc_res -====>', db_fnc_res );

                    if (ws.data.clientId == payLoad.clientId) {

                        ws.send(JSON.stringify({ clientId: ws.data.clientId, db_fnc_response: payLoad.db_fnc, response: db_fnc_res }));
                    }

                }

                if (payLoad.db_action && typeof SqyDB.db_ops[payLoad.db_action] == 'function') {

                    ws.data.clientId = payLoad.clientId
                    // delete payLoad.db_action;

                    let db_res = await SqyDB.db_ops[payLoad.db_action](payLoad);

                    // console.log(' 321 db_res in dnode -====>>>', db_res);

                    if (ws.data.clientId == payLoad.clientId) {

                        ws.send(JSON.stringify({ clientId: ws.data.clientId, db_action_response: payLoad.db_action, response: db_res }));
                    }


                }


            }
        }

    })
}

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

SqyDB.fncs.initialize_collection = async function (options_) {

    // if (!options_ || !options_.db || !options_.collection) { return }

    // let startTime = Date.now();
    // let _DBs = _u.makeArray( config.databases );
    // console.log(' setting up collection for :: ->', options_);

    // @@ create collection folder or set stats from scsn if folder exists

    // SqyDB.connect.worker.send(
    //     JSON.stringify({
    //         work_type: 'initialize_collection', clientId: options_.clientId, collection: options_.collection,
    //         inDir: config.db_data_dir
    //     })
    // );



    // * -- @@  -- polling 
    // -- set stats from returned collection results
    if (!SqyDB_stats[options_.collection]) {

        SqyDB_stats[options_.collection] = SqyDB_stats[options_.collection] || { last_num: 3000, last_node_dir: 1 };
        // SqyDB_stats[options_.collection].last_num = SqyDB_stats[options_.collection].last_num || 0;
        // SqyDB_stats[options_.collection].last_node_dir = SqyDB_stats[options_.collection].last_node_dir || 0;

        SqyDB_index._id[options_.collection] = SqyDB_index._id[options_.collection] || {};

        SqyDB_Cache[options_.collection] = SqyDB_Cache[options_.collection] || {};

    }

    // const SqDBWorker = new Worker("./SqyDBWorker.js");

    // SqDBWorker.postMessage(
    //     {
    //         fnc: 'check_or_setup_collection',
    //         // connection_state: SqyDB.connection_state, 
    //         collection: options_.collection,
    //         inDir: config.db_data_dir
    //     });


    SqyDB.connect.worker.send(

        JSON.stringify({
            work_type: 'check_or_setup_collection',
            clientId: options_.clientId, collection: options_.collection,
            inDir: config.db_data_dir
        })

    );



    // SqDBWorker.onmessage = async event => {

    //     // console.log('SqyDB worker sent back result 00  --->', event.data.result );

    //     if (event.data.result && event.data.result == 'check_or_setup_collection') {

    //         // SqyWorker.fncs[event.data.fnc](event.data);
    //         // console.log('SqyDB worker sent back result  --->', event.data, 'args ::', `${Bun.argv[Bun.argv.indexOf('--node') + 1]}` );
    //         if ( event.data.msg == 'EXISTS' && !SqyDB.now_caching_from_disk ) {

    //             SqyDB.now_caching_from_disk = true;

    //             let scan_coll_res = await scan_and_cache_collections({
    //                 node: `${Bun.argv[Bun.argv.indexOf('--node') + 1]}`,
    //                 inDir: config.db_data_dir
    //             });


    //         SqyDB_Cache = scan_coll_res.SqyDB_cache;
    //         SqyDB_stats = scan_coll_res.SqyDB_stats;

    //         console.log(  'scan_coll_res -====<>>>>>', ' --> ', Object.keys(SqyDB_Cache['cpUser']).length );

    //         scan_coll_res = null;
    //         SqyDB.isReady = true;


    //         }
    //         SqDBWorker.terminate();


    //     }

    // }

    // console.log('inint SqyDB_stats-->', SqyDB_stats);

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

        // console.log(' in dnode 476 Worker Response -===-----<<<>>><><<>>> ',
        //     workerResponse, 'SqyDB.connect.worker'
        // );

        // @@ when we done persisting Queue -===== 
        if (workerResponse.result && workerResponse.result == 'persist_queue_to_disk') {

            SqyDB.isWorking = false;

            if (workerResponse.msg == 'DONE') {

                // @@ Check Queue for more persist jobs
                if ( Object.keys(SqyDB_Worker_Queue).length > 0 ) {

                    // @@ -- send queue job to worker
                    SqyDB.fncs.send_queue_to_worker_for_persisting();
                }

            }

        }

        if (workerResponse.result && workerResponse.result == 'check_or_setup_collection') {

            // SqyWorker.fncs[event.data.fnc](event.data);
            // console.log('SqyDB worker sent back result  --->', event.data, 'args ::', `${Bun.argv[Bun.argv.indexOf('--node') + 1]}` );
            if (workerResponse.msg == 'EXISTS' && !SqyDB.now_caching_from_disk) {

                SqyDB.now_caching_from_disk = true;

                let scan_coll_res = await scan_and_cache_collections({
                    node: `${Bun.argv[Bun.argv.indexOf('--node') + 1]}`,
                    inDir: config.db_data_dir
                });


                SqyDB_Cache = scan_coll_res.SqyDB_cache;
                SqyDB_stats = scan_coll_res.SqyDB_stats;

                console.log('scan_coll_res -====<>>>>>', ' --> ', Object.keys(SqyDB_Cache['cpUser']).length);

                scan_coll_res = null;
                SqyDB.isReady = true;

            }

            if ( workerResponse.msg == 'DONE' && !SqyDB.now_caching_from_disk ) {

                SqyDB.isReady = true;
            }

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




SqyDB.setup_cache_connection = function () {


    SqyDB.connect.cache = new WebSocket(`ws://localhost:${config.db_cache_port}`);

    // console.log('--- now setting up DB Connection for --->', this.collection, 'SqyDB.connect.cache');

    SqyDB.connect.cache.onopen = function (event) {

        console.log('Socket connected -===-----<<<>>><><<>>> ', 'SqyDB. Cache connection intialized on DB');

    };

    SqyDB.connect.cache.onmessage = function (e) {

        const payLoad = JSON.parse(e);
        // let sock_ = this.socket;

        // console.log('in dnode 347 Cache returned message -===-----<<<>>><><<>>> ', payLoad, 'SqyDB.connect.cache');
        if (payLoad.type == 'DB_initialized') {

            // socket.data.sockId = message.username;

            // Broadcast that a user joined

            // SqyDB.connect.cache.send(
            //     JSON.stringify({ type: 'setup_clientId', clientId: _self.collection })
            // );

        }

        if (payLoad.db_action_response) {

            // == 'db_action_response'
            // socket.data.sockId = message.username;

            // Broadcast that a user joined
            // SqyDB.connect.cache.send(
            //     // `notif_channel_${message.username}`,
            //     JSON.stringify( { type: 'setup_clientId', clientId: _self.collection } )
            // );
            console.log('Worker returned message ------>>>>', payLoad);

            // theResponder[payLoad.clientId] = payLoad.response;

            // @@ -- set responder -- to processing mode
            // theResponder[clientId] = '$$$__processing$$$';

        }

    };

    SqyDB.connect.cache.onclose = function (e) {

        // const payLoad = JSON.parse(e.data);

        // console.log('Socket close -===-----<<<>>><><<>>> ', e);
        setTimeout(function () {
            SqyDB.setup_cache_connection();
        }, 800)

    };

};
















// @@ setup

SqyDB.setup_cache_connection = function () {


    SqyDB.connect.cache = new WebSocket(`ws://localhost:${config.db_cache_port}`);

    // console.log('--- now setting up DB Connection for --->', this.collection, 'SqyDB.connect.cache');

    SqyDB.connect.cache.onopen = function (event) {

        console.log('Socket connected -===-----<<<>>><><<>>> ', 'SqyDB. Cache connection intialized on DB');

    };

    SqyDB.connect.cache.onmessage = function (e) {

        const payLoad = JSON.parse(e);
        // let sock_ = this.socket;

        // console.log('in dnode 347 Cache returned message -===-----<<<>>><><<>>> ', payLoad, 'SqyDB.connect.cache');
        if (payLoad.type == 'DB_initialized') {

            // socket.data.sockId = message.username;

            // Broadcast that a user joined

            // SqyDB.connect.cache.send(
            //     JSON.stringify({ type: 'setup_clientId', clientId: _self.collection })
            // );

        }

        if (payLoad.db_action_response) {

            // == 'db_action_response'
            // socket.data.sockId = message.username;

            // Broadcast that a user joined
            // SqyDB.connect.cache.send(
            //     // `notif_channel_${message.username}`,
            //     JSON.stringify( { type: 'setup_clientId', clientId: _self.collection } )
            // );
            console.log('Worker returned message ------>>>>', payLoad);

            // theResponder[payLoad.clientId] = payLoad.response;

            // @@ -- set responder -- to processing mode
            // theResponder[clientId] = '$$$__processing$$$';

        }

    };

    SqyDB.connect.cache.onclose = function (e) {

        // const payLoad = JSON.parse(e.data);

        // console.log('Socket close -===-----<<<>>><><<>>> ', e);
        setTimeout(function () {
            SqyDB.setup_cache_connection();
        }, 800)

    };

};



SqyDB.start = function () {

    SqyDB.node_num = parseInt(Bun.argv[Bun.argv.indexOf('--node') + 1]);

    // console.log('start DB -->', Bun.argv, 'node_num --===>', SqyDB.node_num );

    // @@ only the first node can spin other Nodes
    if (SqyDB.node_num == 1) {

        // SqyDB.spin_extra_nodes();

        // const SqDBWorker = new Worker("./SqyDBWorker.js");
        // SqDBWorker.postMessage( 
        //     { fnc: 'spin_extra_nodes', 
        //       connection_state: SqyDB.connection_state, config 
        //     });

    }


    SqyDB.open_connection_interface();

    SqyDB.setup_worker_connection();

    // SqyDB.setup_cache_connection();

    // setTimeout(function() {
    //     SqyDB.start_cache();
    // }, 2000)

    // @@ test -===================

    // let data = {
    //     'name': 'vic',
    //     'age': 34
    // };

    // SqyDB.db_ops.set({ db: 'CP_DB', data });


}




SqyDB.start();