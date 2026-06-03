// scan_disk_to_cache

import fs from 'node:fs';

const { value_from_key_depth } = await import('./value_from_key_depth.js');

// List directory dort by date
// https://stackoverflow.com/questions/30727864/how-to-read-list-of-files-from-directory-sorted-on-date-modified-in-node-js



// @@ scanning to cache should be done better with GOLANG later...

// where scans are done incrementally to avoid out of memory leaks...

// -- nut then not all items will be scanned later on once feeds aggregation is implemented

export const scan_disk_to_cache = async function (admin_report, _Cache, _CacheKeys, _CacheIndex, _CacheStats, _Connections, _commentsCache, _commentsIndex, _options, done_fnc) {

    if (!_options) { return }

    // _Cache.posts = new Map();
    // _Cache.users = new Map();

    // _Cache.users.set('hghuhghg', {
    //     name: 'vic',
    //     'password': 'hy78uhn'
    // });
    
    let scan_quota = 0, done_count = 0;

    let scan_done = function () {

        done_count++;

        if (scan_quota == done_count) {
            done_fnc();
        }
    }

    const scan_admin_report = function () {

        scan_quota++;

        let adminDataPath = _options.config.db_data_dir + '/_admin_report';

        // let exDoc = JSON.parse(fs.readFileSync(`${_options.config.db_data_dir}/${collection}/${node_dir}/${doc}`, 'utf8'));

        fs.readFile(`${adminDataPath}/admin_report.json`, 'utf8', function (err, data) {
            // Display the file content
            if (err) {

                admin_report.report = {};
            }

            else {

                admin_report.report = JSON.parse(data).report;
            }

            // console.log('Admin data ---> ', err, admin_report);

            scan_done();

        });


        // scan_done();

    };

    const scan_collections = function () {

        scan_quota++;


        const _Cache0 = {};
        // const commentCache = {};
        // const _Connections0 = {};

        // console.log(' Scanning Disk :: inDir -->', _options.config.db_data_dir);

        // additional_collections
        let __exclude = _options.config.exclude_scan || [];

        if (_options.config.additional_collections) {
            __exclude = [...__exclude, _options.config.additional_collections]
        }

        let collection_folders = fs.readdirSync(_options.config.db_data_dir);
        collection_folders = collection_folders.filter(dir => dir.indexOf('DS_Store') == -1);

        collection_folders = collection_folders.filter(dir => __exclude.indexOf(dir) == -1);

        // console.log(' collection_folders ---> ', collection_folders);

        // const readFiles = [];
        if (collection_folders.length < 1) { scan_done(); return }

        collection_folders.forEach(async (collection) => {


            if (fs.lstatSync(`${_options.config.db_data_dir}/${collection}`).isDirectory()) {

                _Cache0[collection] = [];
                // new Map();

                _CacheKeys[collection] = [];

                _CacheStats[collection] = { last_num: _options.config.db_node_limit + 1, last_node_dir: 1, collection_index: [] };

                // @@ -- Indexes --- add more from config here 
                if (_options.config.collection_index && _options.config.collection_index[collection]) {
                    _CacheStats[collection].collection_index = ['_id', ..._options.config.collection_index[collection]]
                }

                // console.log(' this_col_index -===>',  _CacheStats[collection].collection_index );
                _CacheIndex[collection] = { _id: {}, others: {} };

                // @@ list the node folders in each collection dir
                let collection_folders_nodes = fs.readdirSync(`${_options.config.db_data_dir}/${collection}`);
                collection_folders_nodes = collection_folders_nodes.filter(dir => dir.indexOf('DS_Store') == -1);

                // @@ for Each node folders
                collection_folders_nodes.forEach(node_dir => {

                    // @@ list files ---
                    if (fs.lstatSync(`${_options.config.db_data_dir}/${collection}/${node_dir}`).isDirectory()) {

                        // console.log('node folders :: ->', collection, ' ',  node_dir );
                        // @@ read the JSON documents in node dir
                        fs.readdirSync(`${_options.config.db_data_dir}/${collection}/${node_dir}`).forEach(async (doc, i) => {

                            // @@ process only the JSON ones 
                            if (/[(.json)]$/.test(doc)) {

                                let patho = `${_options.config.db_data_dir}/${collection}/${node_dir}/${doc}`;
                                // @@ populate a parse doc into sqye_cache 
                                let readFile = fs.readFileSync(patho, 'utf8');

                                // console.log('readFile --->', doc, 'readFile' );

                                let exDoc = JSON.parse(readFile);
                                // let exDoc = Bun.file(patho);
                                // exDoc = await exDoc.text()
                                // exDoc = await exDoc.json();
                                _Cache0[collection].push(exDoc);


                            }

                        })

                    }

                })


                // let fileContent = await Bun.file(`${dir}/${file_one}`).json();
                // // return await Bun.file(`${dir}/${file_one}`).json();
                // ll++;
                // // console.log('fileContent :: -->', fileContent );
                // readFiles.push(fileContent);

                // if (ll == l) { run_sort() }

            }

        })



        // @@ After reading docs to temp sorter... time to sort each collection
        Object.keys(_Cache0).forEach(col => {

            // _Cache[col] = new Map();
            _Cache[col] = {};

            _CacheKeys[col] = [];

            _Cache0[col].sort(function (a, b) {
                return b.$t$ - a.$t$;
            })
                .forEach(doc => {

                    // _Cache[col].set(doc._id, doc);
                    _Cache[col][doc._id] = doc;

                    if ( _options.config.sort_collection.indexOf(col) > -1 ) {

                        _CacheKeys[col].push({ $t$: doc.$t$, _id: doc._id });

                    }

                    // @@ -- Indexes --- 
                    _CacheStats[col].collection_index.forEach(indx => {

                        // _CacheIndex
                        let v = value_from_key_depth(indx, doc);
                        // if (v !== "$null") {

                        //     _CacheIndex[col][v] = doc._id;
                        // }

                        if (indx == '_id') {
                            _CacheIndex[col]['_id'][v] = doc._id;
                        }

                        else if (v !== "$null") {
                            _CacheIndex[col]['others'][v] = doc._id;
                        }

                    })

                    _CacheStats[col].last_num--;

                    if (_CacheStats[col].last_num === 0) {
                        _CacheStats[col].last_num = _options.config.db_node_limit;
                        _CacheStats[col].last_node_dir++;
                    }


                })


        })

        scan_done();
    }



    const scan_collectives = function () {


        scan_quota++;


        let _commentsIndex0 = {};

        let comm_dir = _options.config.db_data_dir + '/_collectives/';

        if (!fs.existsSync(`${comm_dir}`)) { scan_done(); return }

        let _comm_id_dir = fs.readdirSync(comm_dir);
        _comm_id_dir = _comm_id_dir.filter(dir => dir.indexOf('DS_Store') == -1);

        // @@ filter out the ones that doesn't need indexing
        // _comm_id_dir = _comm_id_dir.filter(dir => _options.config.connections_to_index.indexOf(dir) > -1);

        // console.log(' _comm_id_dir ---> ', comm_dir, _comm_id_dir);

        // const readFiles = [];
        // each_resource_id
        // type

        _comm_id_dir.forEach(async (res_id) => {


            if (fs.lstatSync(`${comm_dir}/${res_id}`).isDirectory()) {

                _commentsIndex[res_id] = _commentsIndex[res_id] || [];

                _commentsIndex0[res_id] = _commentsIndex0[res_id] || [];


                // @@ each node folder iin each id
                let _id_node_dirs = fs.readdirSync(`${comm_dir}/${res_id}/`);
                _id_node_dirs = _id_node_dirs.filter(dir => dir.indexOf('DS_Store') == -1);

                _id_node_dirs.forEach(_each_node_dir => {

                    // @@ list type files 
                    // let each_type_file = fs.readdirSync(`${comm_dir}/${res_id}`);
                    if (fs.lstatSync(`${comm_dir}/${res_id}/${_each_node_dir}`).isDirectory()) {

                        // _Connections[type][each_resource_id] = _Connections[type][each_resource_id] || {};

                        fs.readdirSync(`${comm_dir}/${res_id}/${_each_node_dir}`).forEach(async (doc, i) => {

                            // _Connections[type][each_resource_id] = _Connections[type][each_resource_id] || {};
                            // @@ process only the JSON ones 
                            if (/[(.json)]$/.test(doc)) {
                                // @@ populate a parse doc into sqye_cache 
                                let commDoc = JSON.parse(fs.readFileSync(`${comm_dir}/${res_id}/${_each_node_dir}/${doc}`, 'utf8'));

                                let _id = doc.slice(0, -5);

                                // _Connections[type][each_resource_id][_id] = '-';
                                // _commentsIndex[res_id][_id] = "-";
                                _commentsIndex0[res_id].push({ $t$: commDoc.$t$, _id });

                                _commentsCache[_id] = commDoc;
                                // _Cache0[collection].push(conDoc);

                            }

                        })

                    }

                });


            }

        })


        // @@ -- sort comments
        let commKeys = Object.keys(_commentsIndex0);
        // console.log('commKeys ---->', commKeys );

        commKeys.forEach( res_id => {

            // _Cache[col] = new Map();
            // _Cache[col] = {};

            // _CacheKeys[col] = [];

            _commentsIndex0[res_id].sort(function (a, b) {
                return a.$t$ - b.$t$;
            })
                .forEach( comm => {

                    _commentsIndex[res_id].unshift(comm._id);
                })

        })

        // console.log('_commentsIndex ---->', _commentsIndex );

        scan_done();
    }


    try {

        scan_admin_report();

        scan_collections();

        // scan_connections();

        scan_collectives();

    } catch (error) {

        console.log('Err -->', error);

    }

    // setTimeout(function () {

    //     done_fnc();

    // }, 2000)

}