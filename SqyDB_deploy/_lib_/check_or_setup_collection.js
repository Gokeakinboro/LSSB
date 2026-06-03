import fs from 'node:fs';

export const check_or_setup_collection = async function (options) {


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

    // let additional_collections = ['_connections', "_comments", '_chats'];

    // options.collection = [...options.collection, ...additional_collections];

    if ( !fs.existsSync(`${options.inDir}/${options.collection}`) ) {

        // console.log(`${options.collection} doesn't exist -- gotta create`);

        // Create collection folder here
        fs.mkdir(`${options.inDir}/${options.collection}`, (err) => {


            if (err) { console.error(err); return }

            console.log(` coll dir ${options.collection} created successfully! `);

            // let _node;

            // // @@ for each collection create 50 node folders
            // // @@ each node folder will have 100 docs each
            // // -- more node folders will be created by service workers
            // for (let i = 1; i <= 200; i++) {

            //     // console.log('node folder -->', preceeder_(i, 3) );
            //     // _node = preceeder_(i, 5);
            //     _node = ("" + i).padStart(6, "0");
            //     // _node = i;

            //     // @@ if the collection folder doesn't already exist create it 
            //     if ( !fs.existsSync(`${options.inDir}/${options.collection}/${_node}`) ) {

            //         fs.mkdir(`${options.inDir}/${options.collection}/${_node}`, (err) => {
            //             if (err) { return console.error(err) }
            //             // console.log(`_node ${_node} created successfully!`);
            //         });
            //     }


            // }
            // _node = null;


        })

        return {
            msg: 'DONE',
            collection: options.collection,
            result: 'check_or_setup_collection',
            clientId: options.clientId
        }

    }

    return {
        msg: 'EXISTS',
        collection: options.collection,
        result: 'check_or_setup_collection',
        clientId: options.clientId
    }


}
