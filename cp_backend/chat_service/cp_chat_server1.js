// const { config } = await import('../_configs/app_service_config.js');

// const { API_processor } = await import('./_lib_/API_processor.js');


// const file_server = require('./_lib_/file_server');

// @@ Backend Headers

// const { backendHeaders } = await import('./_lib_/backendHeaders.js');

// console.log('in APPPO --- config -==-----<><><>>>>', config.ROOT_DIR);


// https://stackoverflow.com/questions/62856233/best-way-to-connect-2-separate-node-processes-with-socket-io-communicating-to-a
// https://stackoverflow.com/questions/74846139/how-to-pass-ws-connection-socket-from-parent-process-to-child-process

const ROOT_DIR = import.meta.dir + '/../';

const { chat_utils } = await import('./chat_utils.js');

// console.log('in ROOT_DIR --- config -==-----<><><>>>>', ROOT_DIR);

// pm2 start --interpreter /bin/bun cp_noti_sock1.js

// https://stackoverflow.com/questions/19691996/nodejs-websocket-how-to-reconnect-when-server-restarts?rq=3
// https://stackoverflow.com/questions/40328450/how-to-re-connect-a-browser-websocket-client?rq=3
// https://github.com/websockets/ws/issues/1142
// https://github.com/websockets/ws/issues/1444
// https://stackoverflow.com/questions/41074052/how-to-terminate-a-websocket-connection
// https://github.com/websockets/ws/blob/7d7ddfd2e2e010bbdba6acfd9b8fb0f0ab79c951/lib/websocket-server.js#L292

// https://www.reddit.com/r/node/comments/13oqbvi/i_have_done_a_full_benchmark_of_a_post_rest_api/

// const fs = require('fs'); 

// const _static_dir = `static`;
const _static_dir = `static`;

const ENV_VARS_path = `${ROOT_DIR}_configo_xRF/_config.json`;

let ENV_VARS = Bun.file(ENV_VARS_path);

ENV_VARS = await ENV_VARS.json();


console.log('in ENV_VARS --- config -==-----<><><>>>>', ENV_VARS);

let start_ws = function () {


    /**
     * @@ The server - Backx
     */

    const messages = [];
    let users = [];
    // let not_count = 0;

    Bun.serve({
        port: ENV_VARS.chat_server_port,
        fetch(req, server) {
            // upgrade the request to a WebSocket

            const success = server.upgrade(req, {
                // Set username to semi-random text, collisions probably do not use in production
                // data: { username: "user_" + Math.random().toString(16).slice(12) },
                data: { not_count: 0 }
            });

            // console.log(' Sock server running ---->>', 'data', ENV_VARS.chat_server_port );

            return success
                ? undefined
                : new Response("Upgrade failed :(", { status: 500 });
        },
        websocket: {

            open(ws) {
                // Store username
                // users.push(ws.data.username);

                console.log(' now connected to socket ---->>', 'ws', ws.data );


                // Subscribe to pubsub channel to send/receive broadcasted messages,
                // without this the socket could not send events to other clients
                // ws.subscribe("chat");

                // Broadcast that a user joined
                // ws.publish(
                //     "chat",
                //     JSON.stringify({ type: "USERS_ADD", data: ws.data.username })
                // );

                // Send message to the newly connected client containing existing users and messages
                // ws.send(JSON.stringify({ type: "USER_SET", user: ws.data.username }));
                ws.send(JSON.stringify({ type: "USER_initialized", user: ws.data.username }));
                // ws.send(JSON.stringify({ type: "MESSAGES_SET", data: messages }));

            },
            async message(ws, data) {
                // Data sent is a string, parse to object
                const message = JSON.parse(data);
                // message.username = ws.data.username;
                // messages.push(message);
                // console.log('New Message from App --->', message);

                // if (message.action_type == 'init_notifi') {

                //     let not_count = 0;

                //     setInterval(function () {

                //         not_count++;

                //         // console.log('Pushing vic notification', not_count);
                //         if (ws.data.username == '')
                //             ws.send(
                //                 `notif_channel_victor`,
                //                 JSON.stringify({ type: "new_notifi", msg: `You have ${not_count} new notification(s) vic` })
                //             );

                //     }, 3000);

                // }

                if ( message.action_type == "new_chat_message") {

                    // ws.data.sockId = message.username;


                    console.log(' New chat Message from App --->', message , ws.data.sockId, `chat_${message.toUser}_${message.fromUser}` );

                    // if (ws.data.sockId == message.fromUser ) {
                        // @@ -- Persist chat
                        await chat_utils.persist_chat(message);

                        ws.publish(
                            // `notif_channel_victor`,
                            `chat_${message.toUser}_${message.fromUser}`,
                            JSON.stringify({ type: "new_chat_msg_from_chat_partner", fromUser: message.fromUser, chatMessage: message.chatMessage })
                        );


                    // }

                }

                if (message.action_type == 'setup_and_join_rooms') {

                    ws.data.sockId = message.userId;

                    // Subscribe to pubsub channel to send/receive broadcasted messages,
                    // without this the socket could not send events to other clients
                    // ws.subscribe("chat");
                    console.log(' Setup Rooms --->', message , ws.data.sockId );

                    // for each message
                    if ( typeof message.rooms_to_sub.length == 'number' && message.rooms_to_sub.length > 0 ) {
                        
                        message.rooms_to_sub.forEach( room_channel => {
                            
                            ws.subscribe(`chat_${message.userId}_${room_channel}`);

                            console.log(' Rooms Joined --->', `chat_${message.userId}_${room_channel}` );

                        })
                    }

                    // Broadcast that a user joined
                    // if (message.joinCount < 1) {

                    //     ws.publish(
                    //         "chat",
                    //         JSON.stringify({ type: "USER_JOINED_CHAT", username: message.username })
                    //     );
                    // }
                    // ws.publish(
                    //     "chat",
                    //     JSON.stringify( { type: "USER_JOINED_CHAT", user: ws.data.username } )
                    // );

                }

                if ( message.action_type == "join_chat_cluster") {

                    ws.data.sockId = message.userId;

                    if (ws.data.sockId == message.userId ) {
                        ws.send(
                            // `notif_channel_victor`,
                            JSON.stringify({ type: "user_ready_to_chat", msg: `You have ${ws.data.not_count} new notification(s) fullname` })
                        );
                    }

                }

                if (message.action_type == 'setup_chat_channel') {

                    // Subscribe to pubsub channel to send/receive broadcasted messages,
                    // without this the socket could not send events to other clients
                    // ws.subscribe(`notif_channel_${message.username}`);
                    ws.data.sockId = message.userId;

                    // Broadcast that a user joined
                    // if ( message.joinCount < 1) {

                    ws.send(
                        // `notif_channel_${message.username}`,
                        JSON.stringify({ type: 'new_notifi', msg: "You have joined ---===---<><>>>> ", userId: message.userId })
                    );
                    // }
                    // ws.publish(
                    //     "chat",
                    //     JSON.stringify( { type: "USER_JOINED_CHAT", user: ws.data.username } )
                    // );

                   

                    

                    ws.data.timer_one = setInterval(function () {

                        ws.data.not_count++;

                        if (ws.data.not_count == 10) { 
                            clearInterval(ws.data.timer_one);
                            return 
                        }

                        // console.log('Pushing vic notification', not_count);
                        // message.username
                        if (ws.data.sockId == 'Vicman') {
                            ws.send(
                                // `notif_channel_victor`,
                                JSON.stringify({ type: "new_notifi", msg: `You have ${ws.data.not_count} new notification(s) vic` })
                            );
                        }

                    }, 30000);


                }

                if (message.action_type == 'join_chat_room_99') {

                    // Subscribe to pubsub channel to send/receive broadcasted messages,
                    // without this the socket could not send events to other clients
                    ws.subscribe("chat");

                    // Broadcast that a user joined
                    if (message.joinCount < 1) {

                        ws.publish(
                            "chat",
                            JSON.stringify({ type: "USER_JOINED_CHAT", username: message.username })
                        );
                    }
                    // ws.publish(
                    //     "chat",
                    //     JSON.stringify( { type: "USER_JOINED_CHAT", user: ws.data.username } )
                    // );

                }

                

                // Send message to all clients subscribed to the chat channel with new message
                // setInterval(function () {

                // ws.publish(
                //     "chat",
                //     JSON.stringify({ type: "$sock_notification$", data: message })
                // );
                

                // ----------- @@ - last working
                // ws.send(
                //     // "chat",
                //     JSON.stringify({ type: "new_notifi", data: message })
                // );
                // -----------=========

                // }, 1500); 


            },
            close(ws) {
                // users = users.filter((username) => username !== ws.data.username);

                // Send message to all clients subscribed to the chat channel that user left
                ws.publish(
                    "chat",
                    JSON.stringify({ type: "USERS_REMOVE", data: ws.data.username })
                );

                ws.terminate();
            },
        },
    });


};

start_ws();