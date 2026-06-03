// const { fs } = await import('./_config.js');
import fs from 'node:fs';
const { config } = await import('./_config.js');

const { feed_worker } = await import('./feed_worker.js');


const SqyWorker = {};

SqyWorker.fncs = {};

SqyWorker.initialize_connection = function () {



    Bun.serve({
        port: config.db_worker_port,
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

                // SqyDB.connection = ws;
                console.log(' now connected to SqDB Worker ---->>', 'ws');

                // Subscribe to pubsub channel to send/receive broadcasted messages,
                // without this the socket could not send events to other clients
                // ws.subscribe("chat");


                // ws.send(JSON.stringify({ type: "DB_initialized", user: ws.data.con_count }));
                // ws.send(JSON.stringify({ type: "MESSAGES_SET", data: messages }));

            },
            async message(ws, options) {

                const payLoad = JSON.parse(options);
                console.log('Worker received message -===>', payLoad);

                ws.data.clientId = payLoad.clientId;

                // if (payLoad.type == 'setup_client_id') {
                //     ws.data.clientId = payLoad.clientId;
                // }

                // if ( event.data.fnc && typeof SqyWorker.fncs[event.data.fnc] == 'function' ) {

                //     let res = await SqyWorker.fncs[event.data.fnc](event.data);

                //     // console.log('worker function res --=>', res );

                //     self.postMessage(res);
                // }

                if (payLoad.work_type && typeof SqyWorker.fncs[payLoad.work_type] == 'function') {

                    let res = await SqyWorker.fncs[payLoad.work_type](payLoad);

                    if (ws.data.clientId == res.clientId) {


                        ws.send(JSON.stringify(res));
                    }

                    // return { 
                    //     msg: 'EXISTS', 
                    //     collection: workData.collection, 
                    //     result: 'check_or_setup_collection',
                    //     clientId: workData.clientId 
                    // }

                }



                // if (payLoad.db_action && typeof SqyDB.db_fncs[payLoad.db_action] == 'function') {

                //     ws.data.clientId = payLoad.clientId
                //     // delete payLoad.db_action;

                //     let db_res = await SqyDB.db_fncs[payLoad.db_action]( payLoad );

                //     console.log(' 91 db_res in dnode -====>>>', db_res );

                //     if ( ws.data.clientId == payLoad.clientId ) {

                //         ws.send(JSON.stringify({ clientId: ws.data.clientId, db_action_response: payLoad.db_action, response: db_res }));
                //     }


                // }


            }
        }

    })

};



// SqyWorker.fncs.setup_collection = function (workData) {
SqyWorker.fncs.check_or_setup_collection = async function (workData) {


    // @@ add preceeding zeros to a number
    const preceeder_ = function (start_index, num_of_digits) {

        num_of_digits = num_of_digits || 6;
        start_index = start_index || 1;
        start_index = "" + start_index; // @@ cast  to string

        let add_ = '';
        let deficit = num_of_digits - start_index.length;

        for (let i = 0; i < deficit; i++) {
            add_ += '0';
        }

        start_index = add_ + start_index;
        // console.log('1', nu_, nu_.length, deficit, add_);
        return start_index

    }




    if (!fs.existsSync(`${workData.inDir}/${workData.collection}`)) {

        // console.log(`${workData.collection} doesn't exist -- gotta create`);

        // Create collection folder here
        fs.mkdir(`${workData.inDir}/${workData.collection}`, (err) => {


            if (err) { console.error(err); return }

            console.log(`coll dir ${workData.collection} created successfully!`);

            let _node;


            // @@ for each collection create 50 node folders
            // @@ each node folder will have 100 docs each
            // -- more node folders will be created by service workers
            for (let i = 1; i <= 100; i++) {

                // console.log('node folder -->', preceeder_(i, 3) );
                // _node = preceeder_(i, 5);
                _node = ("" + i).padStart(6, "0");
                // _node = i;

                // @@ if the collection folder doesn't already exist create it 
                if (!fs.existsSync(`${workData.inDir}/${workData.collection}/${_node}`)) {

                    fs.mkdir(`${workData.inDir}/${workData.collection}/${_node}`, (err) => {
                        if (err) { return console.error(err) }
                        // console.log(`_node ${_node} created successfully!`);
                    });
                }


            }
            _node = null;


        })

        return {
            msg: 'DONE',
            collection: workData.collection,
            result: 'check_or_setup_collection',
            clientId: workData.clientId
        }

    }

    return {
        msg: 'EXISTS',
        collection: workData.collection,
        result: 'check_or_setup_collection',
        clientId: workData.clientId
    }


}









SqyWorker.fncs.persist_queue_to_disk = async function (workData) {


    console.log('in worker 216 persist_queue_to_disk --===>>', workData);

    if (workData.work_type == 'persist_queue_to_disk') {


        for (const key in workData.SqyDB_Worker_Queue) {

            // const d = JSON.stringify( SqyDB_Worker_Queue[key].data );
            await Bun.write(workData.SqyDB_Worker_Queue[key].path_plus_item_id + '.json', JSON.stringify(workData.SqyDB_Worker_Queue[key].data));

        }

        return {
            msg: 'DONE',
            result: 'persist_queue_to_disk',
            clientId: workData.clientId
        }

        // console.log('SqyDB_Worker_Queue ----->', workData.SqyDB_Worker_Queue );

    }

};





SqyWorker.run_feeds_ops = function() {

    let done_count;
    // @@ scan all users in collection ---
    // forEach active user,  create a feed and send it to cache (or persist on disk for now)
    feed_worker();
    
}










SqyWorker.start = function () {

    SqyWorker.initialize_connection();
    SqyWorker.run_feeds_ops();
    // console.log('SqyWorker started +++----====__>');

}

SqyWorker.start();

SqyWorker.fncs.spin_extra_nodes__ = async function (options) {

    // SqDBCacheService.postMessage({ readyCheck: "checking.." });
    // console.log('spinning extra nodes --->', config.extra_nodes );
    let done_count = 0;

    // for ( let nodei = 1; nodei <= config.extra_nodes; nodei++ ) {

    //     // const element = array[nodei];
    //     console.log('spinning extra nodes --->', nodei );

    //     if (nodei == done_count) {

    //     }

    // }

    let path = "./dnode1.js";
    let file = Bun.file(path);
    let text = await file.text();

    // console.log(' ---========--------=========---------====>>>>> options', options.config.extra_nodes )
    // return

    // @@ -- Recursivesly run a function until a condition is met
    async function run_until() {



        if (done_count == options.config.extra_nodes) {

            console.log(' ZZZZ Done --- spawning extra nodes', done_count);
            return
        }

        else {

            // const bytes = await Bun.write(`./dnode${done_count + 1}.js`, text);

            // path = null; writePath = null; file = null; text = null;

            console.log(' ----->>> AAAAAA spawning extra nodes', options.config.extra_nodes, 'run count -->', done_count, bytes);

            // run_until();

        }

        done_count++;

    }


    run_until();


    typeof callback == 'function' && callback();

}


// self.onmessage = async (event) => {

//     // console.log('SqyDB worker received --->', event.data);

//     if ( event.data.fnc && typeof SqyWorker.fncs[event.data.fnc] == 'function' ) {

//         let res = await SqyWorker.fncs[event.data.fnc](event.data);

//         // console.log('worker function res --=>', res );

//         self.postMessage(res);
//     }

// }


// console.log('spawning new Nodes in this thread 00 --===');

// console.log(' SqyDBWorker thread started 00 --===>>>><>>> ');

console.log(' SqyDBWorker started 010 --===>>>><>>> ', '--====kkk--===');


// https://blog.logrocket.com/multithreading-node-js-worker-threads/
// https://blog.logrocket.com/optimizing-node-js-app-performance-clustering/
// https://bun.sh/blog/bun-v0.7.2


// https://www.youtube.com/watch?v=EyHaEerthEY
// https://futurestud.io/tutorials/pm2-using-bun-to-start-your-app
// https://bun.sh/docs/runtime/nodejs-apis
