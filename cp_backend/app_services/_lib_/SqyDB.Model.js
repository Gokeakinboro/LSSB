


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


        _self.db_url = config.db_url.replace('$NODE$', `${Bun.argv[Bun.argv.indexOf('--node') + 1]}`);

        _self.db_url = _self.db_url.replace('ws:', 'http:');


        _self.send_request = async function (reqPayLoad) {

            const response = await fetch(_self.db_url, {
                method: "POST",
                body: JSON.stringify(reqPayLoad),
                headers: { "Content-Type": "application/json" },
            });

            return await response.json();

        }

        // @@ works well if we're connecting via socket
        this.setup_connection();

        console.log('--- DB Initialized for --->', this.collection, 'add_port');


    };

    setup_connection() {

        let this_ = this;

        this_.initialize_collection(); // remove for sock
        // return

        // let conEnd = api_node_num > 0 ? ""+api_node_num : "";
        // let runArgs = Bun.argv;
        // let add_port = parseInt(Bun.argv[Bun.argv.indexOf('--node')]);

        // _self.socket = new WebSocket("ws://localhost:5010");
        // let db_url = config.db_url.replace('$NODE$', `${Bun.argv[Bun.argv.indexOf('--node') + 1]}`);
        // let db_url = "ws://localhost:5011";
        // console.log('Model connectiong to -->', db_url );

    }

    async initialize_collection() {

        // let _now = ;
        const coll_ = this.collection, startTime = Date.now();
        // let clientId = coll_ + '__' + startTime;
        let this_ = this;

        // @@ load balance between num of socket instances here -- 
        // --- _self.socket, _self.socket2, _self.socket3

        // @@ -- set request
        let db_res = await _self.send_request({ db_action: 'initialize_collection', collection: coll_ });

        // console.log('Init coll response -====---->><<<<<<<<>>>>> ', db_res);

        // @@ If SystemD$ not ready.. RETRY
        if ( db_res.response && db_res.response == 'SystemD$ NOT READY' ) {

            let timerCol = setTimeout(function () {

                this_.initialize_collection();
                clearTimeout(timerCol);

            }, 2000);

        }

        // @@ wait here till scan to cache is complete
        if (db_res.response && db_res.response == 'OK') {

            _self.isReady = true;

        }


    }

    async setup_resource_collection(options) {

        const coll_ = this.collection, startTime = Date.now();
        // let clientId = coll_ + '__' + startTime;
        let this_ = this;

        // @@ load balance between num of socket instances here -- 
        // --- _self.socket, _self.socket2, _self.socket3

        // @@ -- set request
        let db_res = await _self.send_request({ _id: options._id, db_action: 'setup_resource_collection', collection: coll_ });

        // @@ If SystemD$ not ready.. RETRY
        if (db_res.response && db_res.response == 'SystemD$ NOT READY') {

            let timerCol = setTimeout(function () {

                this_.setup_resource_collection();
                clearTimeout(timerCol);

            }, 400);

        }

        // @@ wait here till scan to cache is complete
        // if (db_res.response && db_res.response == 'OK') {

        //     _self.isReady = true;

        // }

    }

    async set(options) {

        // return { success: trye, statusCode: 200, data: { msg: 'OK'}  }

        if (!_self.isReady) { return { msg: 'SystemD$ NOT READY' } }

        // @@ append client ID in options to socket
        // console.log(' in SqyDB.model -- 98 - 000 now setting on --->', this.collection, '\n payload data ---> ', options.data);

        let collection = this.collection;

        // options.clientId = this.collection + '__';

        // @@ load balance between num of socket instances here -- 
        // --- _self.socket, _self.socket2, _self.socket3
        // options.clientId += '$$set';

        const _d = new Date();
        options.data['$created_on$'] = _d.toISOString();
        options.data['$last_edited_on$'] = _d.toISOString();

        // options.data['$created_on$']

        // @@ -- HTTP set responder -- to processing mode

        const response = await fetch(_self.db_url, {
            method: "POST",
            body: JSON.stringify({ collection, db_action: 'set', data: options.data, $afterSetFnc: options.$afterSetFnc || null, $extras: options.$extras || null }),
            headers: { "Content-Type": "application/json" },
        });

        const body = await response.json();

        // console.log('Set response -====---->><<<<<<<<>>>>> ', body);

        return body.response


    }

    async run_db_ops(options) {

        if (!_self.isReady) { return { msg: 'SystemD$ NOT READY' } }

        let collection = this.collection;

        // console.log('now getting on --->', collection);
        options.collection = collection;
        // options.db_action = options.db_action;

        // @@ -- HTTP set responder -- to processing mode
        const response = await fetch(_self.db_url, {
            method: "POST",
            body: JSON.stringify(options),
            headers: { "Content-Type": "application/json" },
        });
        

        const body = await response.json();

        // console.log('266 SqyModel check_exists response -====---->><<<<<<<<>>>>> ', body);

        return body.response

    }

    async check_exists(options) {

        if (!_self.isReady) { return { msg: 'SystemD$ NOT READY' } }

        let collection = this.collection;

        // console.log('now getting on --->', collection);
        options.collection = collection;
        options.db_action = 'check_exists';

        // @@ -- HTTP set responder -- to processing mode
        const response = await fetch(_self.db_url, {
            method: "POST",
            body: JSON.stringify(options),
            headers: { "Content-Type": "application/json" },
        });

        const body = await response.json();

        // console.log('266 SqyModel check_exists response -====---->><<<<<<<<>>>>> ', body);

        return body.response

    }

    async get(options) {

        if (!_self.isReady) { return { msg: 'SystemD$ NOT READY' } }

        let collection = this.collection;

        // console.log('now getting on --->', collection, options);
        
        options.collection = collection;
        options.db_action = 'get';

        // @@ -- HTTP set responder -- to processing mode
        const response = await fetch(_self.db_url, {
            method: "POST",
            body: JSON.stringify(options),
            headers: { "Content-Type": "application/json" },
        });

        const body = await response.json();

        // console.log('230 SqyModel Get response -====---->><<<<<<<<>>>>> ', body, response );

        return body.response

    }


    async get_sub_resource(options) {

        if (!_self.isReady) { return { msg: 'SystemD$ NOT READY' } }

        // let collection = this.collection;

        // console.log('now getting on --->', collection);
        // options.collection = collection;
        options.db_action = 'get_sub_resource';

        // @@ -- HTTP set responder -- to processing mode
        const response = await fetch(_self.db_url, {
            method: "POST",
            body: JSON.stringify(options),
            headers: { "Content-Type": "application/json" },
        });

        // console.log('287 SqyModel get_sub_resource response -====---->><<<<<<<<>>>>> ', response );

        const body = await response.json();

        // console.log('291 SqyModel get_sub_resource response -====---->><<<<<<<<>>>>> ', body );

        return body.response

    }

    async get_many_from_keys(options) {

        if (!_self.isReady) { return { msg: 'SystemD$ NOT READY' } }

        // let collection = this.collection;

        // console.log('now getting on --->', collection);
        // options.collection = collection;
        options.db_action = 'get_many_from_keys';

        // @@ -- HTTP set responder -- to processing mode
        const response = await fetch(_self.db_url, {
            method: "POST",
            body: JSON.stringify(options),
            headers: { "Content-Type": "application/json" },
        });

        // console.log('287 SqyModel get_sub_resource response -====---->><<<<<<<<>>>>> ', response );

        const body = await response.json();

        // console.log('291 SqyModel get_sub_resource response -====---->><<<<<<<<>>>>> ', body );

        return body.response

    }


    async reset(options) {

        if (!_self.isReady) { return { msg: 'SystemD$ NOT READY' } }


        let data_to_update_keys = Object.keys(options.data);

        if (data_to_update_keys.length < 1) { return 'No Data supplied!' }

        // console.log('now re-setting on --->', this.collection );

        let collection = this.collection;

        // console.log('now getting on --->', collection);
        options.collection = collection;
        options.db_action = 'reset';

        const _d = new Date();
        // options.data['$created_on$'] = _d.toISOString();
        options.data['$last_edited_on$'] = _d.toISOString();

        options.data['$last_edited_by$'] = options.$user$.$uid$;

        options.$afterResetFnc =  options.$afterResetFnc || null
        options.$extras = options.$extras || null

        // @@ -- HTTP set responder -- to processing mode
        const response = await fetch(_self.db_url, {
            method: "POST",
            body: JSON.stringify(options),
            headers: { "Content-Type": "application/json" },
        });

        const body = await response.json();

        // console.log('358 SqyModel Reset response -====---->><<<<<<<<>>>>> ', body, response);

        return body.response



    }

    async reset_many(reset_many_options_) {

        if (!_self.isReady) { return { msg: 'SystemD$ NOT READY' } }

        if ( typeof reset_many_options_.many_data.length !== 'number') { 
            return { msg: 'Invalid reset many options' } 
        }

        let data_error = false;
        for (let index = 0; index < reset_many_options_.many_data.length; index++) {
            const options = reset_many_options_.many_data[index];

            let data_to_update_keys = Object.keys(options.data);

            if (data_to_update_keys.length < 1) {

                data_error = true;
                break;
            }

        }

        if (data_error) { return 'No Data supplied!' }



        // console.log('now re-setting on --->', this.collection);

        // let collection = this.collection;

        // console.log('now getting on --->', collection);
        // options.collection = collection;
        // options.db_action = 'reset';

        // const _d = new Date();
        // options.data['$created_on$'] = _d.toISOString();
        // options.data['$last_edited_on$'] = _d.toISOString();

        // options.data['$last_edited_by$'] = options.$user$.$uid$;

        // @@ -- HTTP set responder -- to processing mode
        const response = await fetch(_self.db_url, {
            method: "POST",
            body: JSON.stringify({ db_action: 'reset_many', get_after_reset: reset_many_options_.get_after_reset || null, many_options: reset_many_options_.many_data}),
            headers: { "Content-Type": "application/json" },
        });

        const body = await response.json();

        console.log('415 SqyModel Reset Many response -====---->><<<<<<<<>>>>> ', body, response);

        return body.response



    }

    async unset(options) {

        if (!_self.isReady) { return { msg: 'SystemD$ NOT READY' } }


        // console.log('now un-setting on --->', this.collection );

        let collection = this.collection;

        // console.log('now getting on --->', collection);
        options.collection = collection;
        options.db_action = 'unset';

        // @@ -- HTTP set responder -- to processing mode
        const response = await fetch(_self.db_url, {
            method: "POST",
            body: JSON.stringify(options),
            headers: { "Content-Type": "application/json" },
        });

        const body = await response.json();

        // console.log('358 SqyModel Reset response -====---->><<<<<<<<>>>>> ', body, response);

        return body.response



    }

    //@@ Run constructor  
    // _self.initialize(options.schema);


}