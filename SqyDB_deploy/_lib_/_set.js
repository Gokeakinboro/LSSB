
// @@ some helpers
const alpha_s = [
    'a', 'b', 'c', 'd', 'e', 'f',
    'g', 'h', 'i', 'j', 'k', 'l',
    'm', 'n', 'o', 'p', 'q', 'r',
    's', 't', 'u', 'v', 'w', 'x',
    'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F',
    'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'Q', 'R',
    'S', 'T', 'U', 'V', 'W', 'X',
    'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
];

const rand_num_btw_1_and = function (num) {
    return Math.floor((Math.random() * num) + 1);
};

const rand_num_btw = function (num1, num2) {

    let rand = Math.floor((Math.random() * num2) + 1);
    // @@ ensure rand number is greater than num1  
    return rand <= num1 ? num1 + 1 : num1;

};

const gen_id = function () {

    let id_ = '', l, now_ = "" + Date.now();
    // now_
    now_ = now_.split('');

    l = now_.length;
    for (let i = 0; i < l; i++) {
        // A a random letter plus rand number 
        id_ += alpha_s[rand_num_btw_1_and(59) - 1] + now_[i];
    }

    return id_

};

export const _set = async function(options, SqyDB_Cache, SqyDB_stats, db_node, dbn_prefix) {


    /* 
     * @@ 1. Generate a unique id 
     * @@ 2. save to cache -- ight be needed soon 
     * @@ 3. save to BD Queue so job workers can save to path 
     * 
     *!*/
    

    if ( typeof options.data == 'undefined' ) { return { msg: 'No data provided' } }

        /* 
        * @@ 1. Generate a unique id 
        * @@ 2. save to cache -- might be needed soon 
        * @@ 3. save to BD Queue so job workers can persist on disk
        * 
        *!*/

        console.log('set hit', options, SqyDB_stats, options.collection, '\n this coll stats --><>><>>>>', SqyDB_stats[options.collection]);

        console.log( ' in _set -----> now setting ---> ', options.data, gen_id() );

        return { msg: 'yo' }

        // return { _id: 'null', msg: 'OK' }
        // * @@ 1. Generate a unique id 
        // @@ this helps solves the order_of_creation problem
        // -- OS folders can now archive based on  numbering
        // let last_num = SqyDB_stats[options.collection].last_num;
        // let last_node = SqyDB_stats[options.collection].last_node;

        // @@ Set last num and last node
        // -- if it's 3000th num we move to the next node folder and start from 1
        SqyDB_stats[this_collection].last_num--;

        if ( SqyDB_stats[this_collection].last_num === 0){
            SqyDB_stats[this_collection].last_num = 3000;
            SqyDB_stats[this_collection].last_node++;
        }

        
        // last_num = last_num == config.db_doc_limit ? 0 : last_num + 1;
        // last_node = last_num == config.db_doc_limit ? last_node + 1 : last_node;

        // "dn10001z1b7D0O7T9p1u2O2m115o4p558001"

        // let _last_node = _u.preceeder_(SqyDB_stats[this_collection].last_node, 5);

        // let _id = config.dbn_prefix + _u.preceeder_(last_num, 4) + gen_id().substring(0, 12) + _last_node;

        let _id = '';

        function check_id() {

            let _id = dbn_prefix + _u.preceeder_(last_num, 4) + _u.gen_id() + _last_node;

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


        let path_plus_item_id = config.db_data_dir + '/' + options.collection + '/' + _last_node + '/' + _id;

        console.log('Time to cache and persist -->>>>', {
            path_plus_item_id,
            data: options.data
        })

};