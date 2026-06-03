import { readdir } from 'node:fs/promises';
import fs from 'node:fs';
import { join } from 'node:path';

// import { Glob } from "bun";

// const glob = new Glob("**/*.ts");

const { config } = await import('../_config.js');


/**
 * @param {string | Buffer | URL} directoryPath
 * @returns {Promise<string[]>} - Array of long file paths
 */

async function getFiles(directoryPath) {

    try {
        const fileNames = await readdir(directoryPath); // returns a JS array of just short/local file-names, not paths.
        const filePaths = fileNames.map(fn => join(directoryPath, fn));
        return filePaths;
    }
    catch (err) {
        console.error(err); // depending on your application, this `catch` block (as-is) may be inappropriate; consider instead, either not-catching and/or re-throwing a new Error with the previous err attached.
    }

}

let sorter = function (data, key, desc) {

    if (!data) { return [] }

    let f = data.sort(function (a, b) {

        a[key] = typeof a[key] == 'string' ? a[key].toLowerCase(): a[key];
        b[key] = typeof b[key] == 'string' ?  b[key].toLowerCase() : b[key];

        if (a[key] < b[key]) {
            return -1;
        }
        if (a[key] > b[key]) {
            return 1;
        }
        return 0;
    });

    if (desc) { return f.reverse() }
    return f
}

const value_from_key_depth = function (key, data) {
    let a;
    if (key.indexOf('.') > -1) {

        // console.log('key dot', key);
        a = key.split('.');
        a = a.map(ei => ei.trim());

        // $null means key value doesn't exist... no need to proceed with check
        // --- 
        if (typeof data[a[0]] == 'undefined') { return '$null' }

        // @@ for 2 e.g _fields._sex
        if (a.length == 2) {

            if (typeof data[a[0]][a[1]] == 'undefined') { return '$null' }
            return data[a[0]][a[1]]

        }

        if (a.length == 3) {

            if (typeof data[a[0]][a[1]] == 'undefined') { return '$null' }
            if (typeof data[a[0]][a[1]][a[2]] == 'undefined') { return '$null' }

            return data[a[0]][a[1]][a[2]]

        }


        // ['_fields.academics.school.course'] = ['_fields', 'academics', 'school', 'course']
        if (a.length == 4) {


            if (typeof data[a[0]][a[1]] == 'undefined') { return '$null' }
            if (typeof data[a[0]][a[1]][a[2]] == 'undefined') { return '$null' }
            if (typeof data[a[0]][a[1]][a[2]][a[3]] == 'undefined') { return '$null' }

            return data[a[0]][a[1]][a[2]][a[3]]

        }

        if (a.length == 5) {


            if (typeof data[a[0]][a[1]] == 'undefined') { return '$null' }
            if (typeof data[a[0]][a[1]][a[2]] == 'undefined') { return '$null' }
            if (typeof data[a[0]][a[1]][a[2]][a[3]] == 'undefined') { return '$null' }
            if (typeof data[a[0]][a[1]][a[2]][a[3]][a[4]] == 'undefined') { return '$null' }

            return data[a[0]][a[1]][a[2]][a[3]][a[4]]

        }


    }

    // console.log('data[key]', key, data, data[key] );

    return data[key] || "$null"
}

export const scan_and_cache_collections = async function (options_) {

    if (!options_) { return }

    let SqyDB_cache = {};
    let SqyDB_stats = {};
    let SqyDB_index = {};
    let SqyDB_sort_cache = {}; 
    
    let startTime = Date.now();

    // let has_docs;

    // for await (const file of glob.scan(".")) {
    //     console.log(' --- file or dir ==----<<>>>>', file ); // => "index.ts"
    // }

    let collection_folders = await getFiles(config.db_data_dir);

    collection_folders = collection_folders.filter(dir => dir.indexOf('DS_Store') == -1);

    // let col_count = collection_folders.length;

    collection_folders.forEach(this_collection => {

        // https://stackoverflow.com/questions/15630770/node-js-check-if-path-is-file-or-directory
        // https://www.geeksforgeeks.org/node-js-stats-isdirectory-method-from-fs-stats-class/
        
        // https://www.geeksforgeeks.org/node-js-fs-lstatsync-method/
        // https://bun.sh/docs/api/glob

        let col_dir = this_collection;
        this_collection = this_collection.substring(this_collection.lastIndexOf('/') + 1);
        
        // console.log('this_collection -===>', this_collection, 'col_dir -====>', col_dir, config.exclude_scan.indexOf(this_collection) == -1 );


        // @@ if this_collection folder is a directory
        if (fs.lstatSync(`${col_dir}`).isDirectory() && config.exclude_scan.indexOf(this_collection) == -1 ) {

            // @@ Set collection Cache for this DB
            SqyDB_cache[this_collection] = {};

            // @@ Set collection stats for this DB
            // -- 12000 docs per collection shard
            // -- then we count down on last num based on number of extra nodes
            // -- 12000/2 = 1500
            // SqyDB_stats[this_collection] = { last_num: 12000 / ( config.extra_nodes + 1 ), last_node_dir: 0 };
            SqyDB_stats[this_collection] = { last_num: 12000, last_node_dir: 1, collection_index: [] };

            SqyDB_sort_cache[this_collection] = [];

            // @@ -- Indexes --- add more from config here 
            if (config.collection_index && config.collection_index[this_collection]) {
                SqyDB_stats[this_collection].collection_index = ['_id', ...config.collection_index[this_collection]]
            }

            // console.log(' this_col_index -===>',  SqyDB_stats[this_collection].collection_index );

            SqyDB_index[this_collection] = { _id: {}, others: {} };
            // -- collection

            // console.log('folders in collection -->', fs.readdirSync(`${config.db_data_dir}/${options_.collection}`) );

            // // @@ set last data  num to 0 since we reading
            // SqyDB_stats[this_collection].last_num = 0;

            // // @@ set last node
            // SqyDB_stats[this_collection].last_node_dir = 0;

            let node_folders = fs.readdirSync(`${col_dir}`);

            if (node_folders.length > 0) {

                // @@ -- read the collections directory, returns and array of each node folder
                node_folders.forEach(node_folder => {

        

                    // @@ if each node folder is a directory
                    if (fs.lstatSync(`${col_dir}/${node_folder}`).isDirectory()) {

                        let has_docs = false;

                        // @@ read the documents in node
                        fs.readdirSync(`${col_dir}/${node_folder}`).forEach(async (doc, i) => {

                            // doc.slice(0,-5) to remove the .json bit for namin 
                            if (i > 0) { has_docs = true }

                            // @@ process only the JSON ones 
                            if (/[(.json)]$/.test(doc)) {
                                // @@ populate a parse doc into sqye_cache 
                                let exDoc = JSON.parse(fs.readFileSync(`${col_dir}/${node_folder}/${doc}`, 'utf8'));
                                // let exDoc = Bun.file(`${col_dir}/${node_folder}/${doc}`);
                                // exDoc = await exDoc.text()
                                // exDoc = await exDoc.json();

                                let _id = doc.slice(0, -5);

                                // console.log('_id -------->', _id );

                                // @@ slice o excluse .json in namin.. set as key on cache 
                                SqyDB_cache[this_collection][_id] = exDoc;

                                if ( config.sort_collection.indexOf(this_collection) > -1 ) {

                                    SqyDB_sort_cache[this_collection].push({
                                        // $created_on$: exDoc.$created_on$,
                                        $t$: exDoc.$t$,
                                        _id: exDoc._id
                                    })
                                }

                                

                                // @@ -- Indexes --- 
                                SqyDB_stats[this_collection].collection_index.forEach(indx => {

                                    // SqyDB_index[this_collection][indx] = exDoc._id;
                                    // { _id: {}, others: {} };
                                    // console.log('value_from_key_depth(indx, exDoc) ->', indx, value_from_key_depth(indx, exDoc), this_collection )
                                    if (indx == '_id') {
                                        SqyDB_index[this_collection]['_id'][exDoc[indx]] = exDoc._id;
                                    }

                                    else if ( value_from_key_depth(indx, exDoc) !== "$null" ) {
                                        SqyDB_index[this_collection]['others'][value_from_key_depth(indx, exDoc)] = exDoc._id;
                                    }

                                })


                                // SqyDB_index._id[this_collection][exDoc.__creator_] = _id;
                                // --- collection

                                SqyDB_stats[this_collection].last_num--;

                                if (SqyDB_stats[this_collection].last_num === 0) {
                                    SqyDB_stats[this_collection].last_num = 12000;
                                    SqyDB_stats[this_collection].last_node_dir++;
                                }

                                // const html_to_extract = JSON.parse(fs.readFileSync(`${files_folder}${filo}`,'utf8'); 
                                exDoc = null; _id = null;
                            }

                            if (/[(.sqyf)]$/.test(doc)) {

                                let exDoc = fs.readFileSync(`${col_dir}/${node_folder}/${doc}`, 'utf8');

                                let _id = doc.slice(0, -5);

                                // console.log('_id -------->', _id );

                                // @@ slice o excluse .json in namin.. set as key on cache 
                                // SqyDB_cache[this_collection][_id] = exDoc;
                                exDoc = exDoc.split(',');

                                // @@ --- forEach exDoc
                                exDoc.forEach( key_val_pairs => {

                                    key_val_pairs = key_val_pairs.split(':');
                                    let kk = key_val_pairs[0].replace(/\"/g, '');
                                    SqyDB_index[this_collection]['_id'][node_folder] = SqyDB_index[this_collection]['_id'][node_folder] || {};
                                    SqyDB_index[this_collection]['_id'][node_folder][kk] = _id;

                                })

                                // @@ -- Indexes --- 
                                // SqyDB_stats[this_collection].collection_index.forEach(indx => {

                                //     // SqyDB_index[this_collection][indx] = exDoc._id;
                                //     // { _id: {}, others: {} };
                                //     if (indx == '_id') {
                                //         SqyDB_index[this_collection]['_id'][exDoc[indx]] = exDoc._id;
                                //     }

                                //     else if ( exDoc[indx] ) {
                                //         SqyDB_index[this_collection]['others'][exDoc[indx]] = exDoc._id;
                                //     }

                                // })


                                // SqyDB_index._id[this_collection][exDoc.__creator_] = _id;
                                // --- collection

                                // SqyDB_stats[this_collection].last_num--;

                                // if (SqyDB_stats[this_collection].last_num === 0) {
                                //     SqyDB_stats[this_collection].last_num = 12000;
                                //     SqyDB_stats[this_collection].last_node_dir++;
                                // }

                                // const html_to_extract = JSON.parse(fs.readFileSync(`${files_folder}${filo}`,'utf8'); 
                                exDoc = null; _id = null;

                            }


                        });

                        // @@ -- if has docs.. set node num on stats
                        // if (has_docs) { SqyDB_stats[this_collection].last_node_dir++ };
                        // has_docs = false;

                    }

                });

            }
            // node foldrs exits


            // console.log('scanned collection  index: -->', this_collection, SqyDB_index[this_collection] );


        }
        // collection is Dir check ---- ENDS

    })

    // setTimeout( function() {
    //     console.log( ' scan and cache done on ----->><>>>', 
    //              SqyDB_stats, '\n \n ==----=<>>>> ', ((Date.now() - startTime ) / 1000) - 0.04, 
    //              SqyDB_cache['cpUser']['27596'].title.rendered
    //            );
    // }, 40);
    // @@ create extra collections

    // config.create_extra_collections.forEach( extra_coll => {

    //     if (!fs.existsSync(`${config.db_data_dir}/${extra_coll}`)) {

    //         // console.log(`${workData.collection} doesn't exist -- gotta create`);

    //         // Create collection folder here
    //         fs.mkdir(`${config.db_data_dir}/${extra_coll}`, (err) => {
    
    
    //             if (err) { console.error(err); return }
    
    //             console.log(`coll dir:: ${extra_coll} created successfully!`);

    //         });

    //     }
    // })

    config.sort_collection.forEach( each_col => {

        SqyDB_sort_cache[each_col] = sorter(SqyDB_sort_cache[each_col], '$t$', 1);
        // sorter
    })

    // console.log('scanned collection  index: -->', 'cpPosts', SqyDB_sort_cache['cpPosts'] );

    return { SqyDB_cache, SqyDB_stats, SqyDB_index, SqyDB_sort_cache }

}