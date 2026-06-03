
const SqDBCacheService = new Worker("./SqyDB_cache.js");

const { config } = await import('./_config.js');

const { _set } = await import('./_lib_/_set.js');

const { _u } = await import('./_lib_/_u.js');

const { _reset } = await import('./_lib_/_reset.js');

const { _unset } = await import('./_lib_/_unset.js');

const SqyDB = {};

const SqyDB_stats = {};

const SqyDB_queue = {};

const SqyDB_index = { _id: {} };

SqyDB.db_ops = {};

SqyDB.fncs = {};

SqyDB.is_caching = false;

SqyDB.db_ready = false;

// @@ attache socket here
SqyDB.connect = { cache: {}, worker: {} };

SqyDB.db_ops.set = async function (options) {

    try {


        // return await _set(options)
        if (typeof options.data == 'undefined') { return { msg: 'No data' } }
        /* 
        * @@ 1. Generate a unique id 
        * @@ 2. save to cache -- might be needed soon 
        * @@ 3. save to BD Queue so job workers can persist on disk
        * 
        *!*/

        console.log('set hit', options, SqyDB_stats, options.collection, '\n this coll stats --><>><>>>>', SqyDB_stats[options.collection] );

        // return { _id: 'null', msg: 'OK' }
        // * @@ 1. Generate a unique id 
        // @@ this helps solves the order_of_creation problem
        // -- OS folders can now archive based on  numbering
        let last_num = SqyDB_stats[options.collection].last_num;
        let last_node = SqyDB_stats[options.collection].last_node;

        // @@ Set last num and last node
        // -- if it's 3000th num we move to the next node folder and start from 1
        last_num = last_num == config.db_doc_limit ? 0 : last_num + 1;
        last_node = last_num == config.db_doc_limit ? last_node + 1 : last_node;

        let _last_node = _u.preceeder_(last_node, 3);

        // let _id = config.dbn_prefix + _u.preceeder_(last_num, 4) + gen_id().substring(0, 12) + _last_node;

        let _id = '';

        function check_id() {

            let _id = config.dbn_prefix + _u.preceeder_(last_num, 4) + _u.gen_id() + _last_node;

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


        let path_plus_item_id = config.db_data_dir + '/' + options.collection + '/' + _last_node + '/' + _id;

        console.log('Time to cache and persist -->>>>', {
            path_plus_item_id,
            data: options.data
        })
        
        return { _id, msg: 'OK' }

        SqyDB.fncs.queue_cache_persist({
            path_plus_item_id,
            data: options.data
        })

        

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

/** 
 * @@ Cache Queue and persit data passed here...
 * Setup folder creation etc
 * --- The Params is an object containing both db name to set collection on and the collection name
 */

SqyDB.fncs.queue_cache_persist = async function (options_) {

    console.log('Time to Cache and persist. ---=>', options_);

    // @@ quickly experiment write
    options_.data = JSON.stringify(options_.data);
    const bytes = await Bun.write(options_.path_plus_item_id+'.json', options_.data);

    console.log('data persisted. ---=>', bytes);

};

SqyDB.open_connection_interface = function () {

    console.log(' Initialize DB Socket Server 1 --> ', config.db_port );

    Bun.serve({
        port: config.db_port,
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
                console.log(' now connected to DB socket ---->>', 'ws');

                // Subscribe to pubsub channel to send/receive broadcasted messages,
                // without this the socket could not send events to other clients
                // ws.subscribe("chat");


                ws.send(JSON.stringify({ type: "DB_initialized", user: ws.data.con_count }));
                // ws.send(JSON.stringify({ type: "MESSAGES_SET", data: messages }));

            },
            async message(ws, options) {

                const payLoad = JSON.parse(options);
                console.log('Sock message -===>', payLoad);

                if (payLoad.type == 'setup_client_id') {
                    ws.data.clientId = payLoad.clientId;
                }

                if (payLoad.db_fnc && typeof SqyDB.fncs[payLoad.db_fnc] == 'function') {

                    ws.data.clientId = payLoad.clientId;

                    let db_fnc_res = await SqyDB.fncs[payLoad.db_fnc](payLoad);

                    if (ws.data.clientId == payLoad.clientId) {

                        ws.send(JSON.stringify({ clientId: ws.data.clientId, db_fnc_response: payLoad.db_fnc, response: db_fnc_res }));
                    }

                }

                if (payLoad.db_action && typeof SqyDB.db_ops[payLoad.db_action] == 'function') {

                    ws.data.clientId = payLoad.clientId
                    // delete payLoad.db_action;

                    let db_res = await SqyDB.db_ops[payLoad.db_action](payLoad);

                    console.log(' 201 db_res in dnode -====>>>', db_res);

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

SqyDB.fncs.setup_collection = async function (options_) {

    // if (!options_ || !options_.db || !options_.collection) { return }

    // let startTime = Date.now();
    // let _DBs = _u.makeArray( config.databases );
    console.log( ' setting up collection for :: ->', options_ );

    // @@ create collection folder or set stats from scsn if folder exists

    SqyDB.connect.worker.send(
        JSON.stringify({
            work_type: 'setup_collection', clientId: options_.clientId, collection: options_.collection,
            inDir: config.db_data_dir
        })
    );


    
    // * -- @@ 
    // -- set stats from returned collection results
    SqyDB_stats[options_.collection] = SqyDB_stats[options_.collection] || {};
    SqyDB_stats[options_.collection].last_num = SqyDB_stats[options_.collection].last_num || 0;
    SqyDB_stats[options_.collection].last_node = SqyDB_stats[options_.collection].last_node || 0;


    SqyDB_index._id[options_.collection] = SqyDB_index._id[options_.collection] || {};


    console.log('inint SqyDB_stats-->', SqyDB_stats);

    return 'OK'

    // console.log(' initialize_DBs done -->', (Date.now() - startTime) / 1000, 'seconds');


}

SqyDB.setup_worker_connection = function () {


    SqyDB.connect.worker = new WebSocket(`ws://localhost:${config.db_worker_port}`);

    // console.log('--- now setting up DB Connection for --->', this.collection, 'SqyDB.connect.cache');

    SqyDB.connect.worker.onopen = function (event) {

        console.log('Socket connected -===-----<<<>>><><<>>> ', 'SqyDB. worker connection intialized on DB');

    };

    SqyDB.connect.worker.onmessage = function (e) {

        const payLoad = JSON.parse(e);
        // let sock_ = this.socket;

        console.log('in dnode 188 Worker returned message -===-----<<<>>><><<>>> ', payLoad, 'SqyDB.connect.cache');
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

    SqyDB.connect.worker.onclose = function (e) {

        // const payLoad = JSON.parse(e.data);

        // console.log('Socket close -===-----<<<>>><><<>>> ', e);
        setTimeout(function () {
            SqyDB.setup_worker_connection();
        }, 800)

    };

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


SqyDB.start_cache = function() {

    SqDBCacheService.postMessage({ readyCheck: "checking.." });
}

SqyDB.start = function () {

    console.log('start DB -->');

    SqyDB.open_connection_interface();

    SqyDB.setup_worker_connection();

    SqyDB.setup_cache_connection();

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