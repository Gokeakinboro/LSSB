


// const { SqyDB_Client } = await import('./SqyDB.client.js');

import { config } from "../../_configo_xRF/app_service_config";

// import { resolve } from "bun";

let _self = { socket: {}, isReady: false };

const theResponder = {};

// @@ recursively check for a soket result until available then resolves
const response_checker = function (clientId, resolve, callback) {

    let u = 0;
    function run() {

        let timer_ = setTimeout(function () {

            u++;
            // console.log('checking -- <_____>>>>> ', theResponder[clientId], u);
            if (theResponder[clientId] !== '$$$__processing$$$') {

                clearTimeout(timer_);

                if (typeof resolve == 'function') {
                    resolve(theResponder[clientId]);
                }

                if (typeof callback == 'function') {

                    callback();
                }
                // resolve(theResponder[clientId]);
                delete theResponder[clientId];
                // return
            }

            else {
                // @@ else call again
                run();
            }


        }, 1 / 100);
    }

    run();
}

// @@ The SqyDB_Model Class        
export class SqyDB_Model {


    constructor(options) {

        // let _self = this;
        this.schema = options.schema;
        this.collection = options.collection;
        _self.collection = options.collection;
        this.indexOn = options.indexOn || {};

        this.initialize(options);
        this.setup_connection();

        // _self.socket = null;


    };

    setup_connection() {

        let this_ = this;

        // let conEnd = api_node_num > 0 ? ""+api_node_num : "";
        // let runArgs = Bun.argv;
        // let add_port = parseInt(Bun.argv[Bun.argv.indexOf('--node')]);

        // _self.socket = new WebSocket("ws://localhost:5010");
        _self.node_id = `${Bun.argv[Bun.argv.indexOf('--node') + 1]}`;

        let db_url = config.db_url.replace('$NODE$', _self.node_id );

        // console.log('Model connectiong to -->', db_url);

        _self.socket = new WebSocket(db_url);

        // console.log('--- now setting up DB Connection for --->', this.collection, '_self.socket');

        _self.socket.onopen = function (event) {

            console.log('Socket connected -===-----<<<>>><><<>>> ', '_self.socket to ---<>>>', db_url);

            this_.setup_collection();

        };

        _self.socket.onmessage = function (e) {

            const payLoad = JSON.parse(e.data);
            // let sock_ = this.socket;

            // console.log('in SDB_MOdel 71 Socket received message -===-----<<<>>><><<>>> ', payLoad, '_self.socket');
            if (payLoad.type == 'DB_initialized') {


                // socket.data.sockId = message.username;

                // Broadcast that a user joined

                // _self.socket.send(
                //     JSON.stringify({ type: 'setup_clientId', clientId: _self.collection })
                // );

            }

            if (payLoad.db_fnc_response) {
                theResponder[payLoad.clientId] = payLoad.response;
            }

            if (payLoad.db_action_response) {

                // == 'db_action_response'
                // socket.data.sockId = message.username;

                // Broadcast that a user joined
                // _self.socket.send(
                //     // `notif_channel_${message.username}`,
                //     JSON.stringify( { type: 'setup_clientId', clientId: _self.collection } )
                // );
                // console.log('payLoad returned message ------>>>>', payLoad);

                theResponder[payLoad.clientId] = payLoad.response;

                // @@ -- set responder -- to processing mode
                // theResponder[clientId] = '$$$__processing$$$';

            }

        };

        _self.socket.onclose = function (e) {

            // const payLoad = JSON.parse(e.data);
            _self.isReady = false;

            // console.log('Socket close -===-----<<<>>><><<>>> ', 'e');

            setTimeout(function () {
                this_.setup_connection();
            }, 600)


        };

    }

    async initialize(options) {

        // console.log('SqyDB_Model Init  ---  --->', this);
        // let client_res = await SqyDB_Client();

        console.log('--- DB Initialized for --->', this.collection, 'add_port');

    }

    async setup_collection() {

        // let _now = ;
        const coll_ = this.collection, startTime = Date.now();
        _self.clientId = coll_ + '__m1__' + _self.node_id; // m1 equals first API machine

        // @@ later device a pool of DB nodes to connect to and num connections on each so as no to overwhelm each

        // @@ load balance between num of socket instances here -- 
        // --- _self.socket, _self.socket2, _self.socket3
        // clientId += '$$setup_coll';

        // @@ -- set responder -- to processing mode
        theResponder[_self.clientId] = '$$$__processing$$$';

        console.log('now setting up colection --------------- ::: ', coll_ )

        setTimeout(function () {

            _self.socket.send(

                JSON.stringify(
                    { db_fnc: 'initialize_collection', clientId: _self.clientId, collection: coll_ }
                )
            );

            // delete  theResponder[clientId]
            // return new Promise((resolve) => {

            response_checker(_self.clientId, null, function () {
                console.log('collection setup for  -->', coll_, theResponder[_self.clientId], ' in --', ((Date.now() - startTime) / 1000) - 100 / 1000);
                _self.isReady = true;
            });
            // })

        }, 100);
        // _now = null;

    }

    async set(options) {


        if (!_self.isReady) { return { msg: 'DB NOT READY' } }

        // @@ append client ID in options to socket
        // console.log(' in SqyDB.model -- 98 - 000 now setting on --->', this.collection, '\n payload data ---> ', options.data);

        let collection = this.collection;

        // options.clientId = this.collection + '__';
        options.clientId = _self.clientId;

        // @@ load balance between num of socket instances here -- 
        // --- _self.socket, _self.socket2, _self.socket3
        // options.clientId += '$$set';

        const _d = new Date();
        options.data['$created_on$'] = _d.toISOString();
        options.data['$last_edited_on$'] = _d.toISOString();

        // @@ -- set responder -- to processing mode
        theResponder[options.clientId] = '$$$__processing$$$';

        _self.socket.send(
            // `notif_channel_${message.username}`,
            JSON.stringify({ collection, db_action: 'set', clientId: options.clientId, data: options.data })
        );

        // @@ set a responder that resolves when results are ready in on message
        // theResponder[options.clientId] = function(resolve, data) {

        //     if (data){
        //         resolve(data);
        //     }

        // }


        return new Promise((resolve) => {

            response_checker(options.clientId, resolve);
        })



    }

    async get(options) {

        if (!_self.isReady) { return { msg: 'DB NOT READY' } }

        let collection = this.collection;

        // options.clientId = collection + '__';
        options.clientId = _self.clientId;
        // options.clientId += '$$get';

        console.log('now getting on --->', collection);

        // @@ -- set responder -- to processing mode
        theResponder[options.clientId] = '$$$__processing$$$';

        _self.socket.send(
            // `notif_channel_${message.username}`,
            JSON.stringify({ collection, db_action: 'get', clientId: options.clientId, data: options.data })
        );

        return new Promise((resolve) => {

            response_checker(options.clientId, resolve);
        })


    }


    async reset(options) {

        if (!_self.isReady) { return { msg: 'DB NOT READY' } }

        console.log('now re-setting on --->', this.collection);



    }

    async unset(options) {

        if (!_self.isReady) { return { msg: 'DB NOT READY' } }

        console.log('now un-setting on --->', this.collection);



    }

    //@@ Run constructor  
    // _self.initialize(options.schema);


}