// const { fs } = await import('./_config.js');
// import fs from 'node:fs';
const { config } = await import('./_config.js');


const SqyDB_Cache = {};

SqyDB_Cache.fncs = {};

SqyDB_Cache.initialize_connection = function () {



    Bun.serve({
        port: config.db_cache_port,
        fetch(req, server) {
            // upgrade the request to a WebSocket

            const success = server.upgrade(req, {
                // Set username to semi-random text, collisions probably do not use in production
                // data: { username: "user_" + Math.random().toString(16).slice(12) },
                data: { con_count: 0 }
            });

            // console.log(' Sock server running ---->>', data);
            clearTimeout(SqyDB_Cache.start_timer)

            return success
                ? undefined

                : new Response("Upgrade failed :(", { status: 500 });
        },
        websocket: {

            open(ws) {
                // Store username
                // users.push(ws.data.username);

                // SqyDB.connection = ws;
                console.log(' now connected to SqDB_Cache ---->>', 'ws');
                

                // Subscribe to pubsub channel to send/receive broadcasted messages,
                // without this the socket could not send events to other clients
                // ws.subscribe("chat");


                // ws.send(JSON.stringify({ type: "DB_initialized", user: ws.data.con_count }));
                // ws.send(JSON.stringify({ type: "MESSAGES_SET", data: messages }));

            },
            async message(ws, options) {

                const payLoad = JSON.parse(options);
                console.log('Worker received message -===>', payLoad);

                // if (payLoad.type == 'setup_client_id') {
                //     ws.data.clientId = payLoad.clientId;
                // }

                if (payLoad.work_type && typeof SqyDB_Cache.fncs[payLoad.work_type] == 'function') {

                    SqyDB_Cache.fncs[payLoad.work_type](payLoad);

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


SqyDB_Cache.start = function () {

    SqyDB_Cache.start_timer = setTimeout(function() {

        SqyDB_Cache.initialize_connection();
        console.log('SqyDB_Cache started +++----====__>');

    }, 1000);
    
    // self.onmessage = event => {
    //     console.log('Sqycache worker received --->', event.data)
    //     postMessage("Sqycache is now running -====")
    // }
    

}


SqyDB_Cache.start();
