import fs from 'node:fs';

const sub_resourcer = {};

const config = {
    db_data_dir: '/Applications/MAMP/htdocs/christDeploy/SqyDB_deploy/../_d_data'
}

const SqyDB_index = {

    $followers: {
        _id: {},
        others: {},
    },

    $followings: {
        _id: {},
        others: {},
    },
};



// console.log(`${workData.collection} doesn't exist -- gotta create`);



// @@ e.g followers
sub_resourcer.update_sub_resource = async function (options) {

    try {

        if (options.ops == "$addTo") {

            SqyDB_index[options.collection]._id[options.$where._id] = SqyDB_index[options.collection]._id[options.$where._id] || {};

            let file_name = ( ( options.current_iteration || 0) + 1) * 10000;

            SqyDB_index[options.collection]._id[options.$where._id][options.indexKey] = "" + file_name;

            // options_.data = JSON.stringify(options_.data);
            let existingDataPath = config.db_data_dir + '/' + options.collection + '/' + options.$where._id;


            let write_file_to_disk = async function () {

                const the_data_file = Bun.file(`${existingDataPath}/${file_name}.sqyf`);
                let new_file = '', file_exists = await the_data_file.exists();

                if (file_exists) {
                    let f = await the_data_file.text();
                    new_file = f.length > 6 ? f + ',' + options.value : options.value;
                }

                else {
                    new_file = options.value;
                }

                await Bun.write(`${existingDataPath}/${file_name}.sqyf`, new_file);

                console.log('file exists ---->', file_exists, new_file, '\n path + name  ::', `${existingDataPath}.sqyf`)

            }

            // @@  first check if the dir for this resource exists in this collection dir
            if (!fs.existsSync(existingDataPath)) {

                // Create collection folder here
                fs.mkdir(existingDataPath, (err) => {
                    write_file_to_disk();
                })
            }

            else {
                write_file_to_disk();
            }

            // SqyDB_Worker_Queue[`${options_.data._id}_set_${Date.now()}`] = options_;

            return 'OK'
        }

        if (options.ops == "$removeFrom") {

            SqyDB_index[options.collection]._id[options.$where._id] = SqyDB_index[options.collection]._id[options.$where._id] || {};

            if (typeof SqyDB_index[options.collection]._id[options.$where._id][options.indexKey] !== 'undefined') {

                let holding_file = SqyDB_index[options.collection]._id[options.$where._id][options.indexKey];
                delete SqyDB_index[options.collection]._id[options.$where._id][options.indexKey];

                // @@ -- read holding file and remove this item
                let existingDataPath = config.db_data_dir + '/' + options.collection + '/' + options.$where._id;

                const the_data_file = Bun.file(`${existingDataPath}/${holding_file}.sqyf`);

                let new_file = '', file_exists = await the_data_file.exists();

                if (file_exists) {

                    new_file = await the_data_file.text();
                    new_file = "{" + new_file + '}';
                    new_file = JSON.parse(new_file);
                    delete new_file[options.indexKey];
                    new_file = JSON.stringify(new_file);
                    new_file = new_file.replace('{', '').replace('}', '');

                    await Bun.write(`${existingDataPath}/${holding_file}.sqyf`, new_file);

                    return 'OK'
                }

                else {
                    // new_file = options.value;
                    return 'nullf'
                }



                return 'OK'


            }

            return 'null'


        }

    } catch (error) {

        console.log('error ---->', error)

    }

    // await SqyDB.fncs.persist_sub_resource(options);

}


sub_resourcer.run = async function () {

    // @@ -- load from disk
    const startTime = Date.now();

    const the_follower_id = '8999V1V21I7Z8L2P8E3j3t7Z0Vh1V1';
    const user_to_follow_id = '111V1VQ35063r1j2p5I7X0h7Vh1V1';

    let _date_ = new Date();
    _date_ = _date_.toISOString();

    const data_o = {
        // ops: "$addTo",
        ops: "$removeFrom",
        collection: '$followings',
        // key: the_follower_id,
        $where: { _id: the_follower_id },
        indexKey: user_to_follow_id,
        value: `"${user_to_follow_id}":"${_date_}"`,
        current_iteration: 0 //
    };

    const options = data_o;
    // @@ first scan to index
    let existingDataPath = config.db_data_dir + '/' + options.collection + '/' + options.$where._id;

    let the_data_file = Bun.file(`${existingDataPath}/10000.sqyf`);

    the_data_file = await the_data_file.text();

    the_data_file = "{" + the_data_file + '}';
    the_data_file = JSON.parse(the_data_file);
    
    SqyDB_index[options.collection]._id[options.$where._id] = {};

    Object.keys(the_data_file).forEach( k => {

        SqyDB_index[options.collection]._id[options.$where._id][k] = '10000';

    })

    console.log(' >>>>>> yay first ---==>', SqyDB_index, ' in --> ', (Date.now() - startTime ) / 1000 );


    let update_res = await sub_resourcer.update_sub_resource(data_o)

    console.log('yo ---==>', SqyDB_index, '\n update_res ::: --->>>', update_res, ' ---->> in <<--- ', (Date.now() - startTime ) / 1000 );

}



sub_resourcer.run();