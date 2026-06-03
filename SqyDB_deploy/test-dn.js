import fs from 'node:fs';

const SqyDB_cache = {};

const SqyDB_stats = { users: { last_num: 0 } };

const fncs = {};

let curr_data_dir = "/Applications/MAMP/htdocs/SqyDB_deploy/../test_data/";

async function main() {


    let bigData = Bun.file("./lssb.online.data.json");
    // exDoc = await exDoc.text()
    bigData = await bigData.json();

    // console.log( 'bigData -===>>>', bigData[0] );

    // return
    let bigL = bigData.length;

    // let _id = data0._id;
    let startTime = Date.now();

    let duplicate_count = 3;

    for (let index = 0; index < bigL; index++) {
        // const element = array[index];

        let eachData = bigData[index];//JSON.parse(data0);

        let _id = eachData._id;

        // for (let ind = 0; ind < duplicate_count; ind++) {
        //     // const element = array[ind];
        //     let _id = eachData._id;
        //     let modifiedD = 
        //     _id = 

        // }


        // let new_id = _id + "" + (index + 1);


        // toWrite._id = new_id;
        eachData = JSON.stringify(eachData);
        const res = await Bun.write(`${curr_data_dir}${_id}.json`, eachData);

        if (res) {

            // console.log('inex ->', );
            if (index == bigL - 1) {
                ended();
            }

        }
    }

    function ended() {

        console.log('done in -->', (Date.now() - startTime) / 1000)
    }

}



async function main_scan() {


    let theJSON_in_node_folder = fs.readdirSync(`${curr_data_dir}`);

    let lll = theJSON_in_node_folder.length;

    let truths = 0;

    let startTime = Date.now();

    let this_collection = 'users';

    SqyDB_cache[this_collection] = {};

    for (let index = 0; index < lll; index++) {

        let doc = theJSON_in_node_folder[index];

        if (/[(.json)]$/.test(doc)) {

            let exDoc = Bun.file(`${curr_data_dir}/${doc}`);
            // exDoc = await exDoc.text()
            exDoc = await exDoc.json();

            // if (index == 0) {
            //     console.log('Doccer -==>', exDoc);
            // }

            // let exDoc = fs.readFileSync(`${curr_data_dir}/${doc}`, 'utf8');
            // exDoc = JSON.parse(exDoc);


            SqyDB_cache[this_collection][doc.slice(0, -5)] = exDoc;

            // if (i == lll - 1) {

            //     // setTimeout(function () {

            //         typeof done == 'function' && dona(startTime);

            //     // }, 1200);

            // }

        }

    }

    typeof dona == 'function' && dona(startTime);




    // @@ read the documents in node
    // theJSON_in_node_folder.forEach(async (doc, i) => {

    //     // --doc.slice(0,-5) to remove the .json bit for namin 
    //     // --if (i > 0) { has_docs = true }

    //     // if (i == 0) { 
    //     //     console.log('Doccer -==>', doc);
    //     //  }


    //     // -- @@ process only the JSON ones 

    //     if (/[(.json)]$/.test(doc)) {
    //         // if (/[(.json)]$/.test(doc)) {    
    //         truths++;

    //         // @@ populate a parse doc into sqye_cache 
    //         // let exDoc = JSON.parse(fs.readFileSync(`${config.db_data_dir}/${options_.db}/${this_collection}/${node_folder}/${doc}`, 'utf8'));
    //         let exDoc = Bun.file(`${curr_data_dir}/${doc}`);

    //         exDoc = await exDoc.json();

    //         // if (i == 0) { 
    //         //     console.log('Doccer -==>', exDoc );
    //         // }

    //         // @@ slice o excluse .json in namin.. set as key on cache 
    //         SqyDB_cache[this_collection][doc.slice(0, -5)] = exDoc;

    //         // SqyDB_stats[this_collection].last_num++;

    //         // const html_to_extract = JSON.parse(fs.readFileSync(`${files_folder}${filo}`,'utf8'); 
    //         // exDoc = null;
    //         // console.log('i ----->', i, 'doc', i == lll - 1, exDoc._id );
    //     }


    //     if (i == 0) { 
    //         console.log('Doccer -==>', SqyDB_cache['bizDB']['posts']["30552"].date_gmt );
    //     }
    //     console.log('iiiiii truths ----->',  truths, i, lll, lll - 1, i == lll - 1 );


    //     exDoc = null;

    //     if (i == lll - 1) {

    //         // setTimeout(function () {

    //             typeof done == 'function' && dona(startTime);

    //         // }, 1200);

    //     }

    // });

    // console.log('jo ->', 'theJSON_in_node_folder', theJSON_in_node_folder.length);

}


fncs.run_dir_scan = async function() {


    let theJSON_in_node_folder = fs.readdirSync(`${curr_data_dir}`);

    let lll = theJSON_in_node_folder.length;

    let startTime = Date.now();

    let this_collection = 'users';

    SqyDB_cache[this_collection] = {};

    for (let index = 0; index < lll; index++) {

        let doc = theJSON_in_node_folder[index];

        if (/[(.json)]$/.test(doc)) {

            let exDoc = Bun.file(`${curr_data_dir}/${doc}`);
            // exDoc = await exDoc.text()
            exDoc = await exDoc.json();


            SqyDB_cache[this_collection][doc.slice(0, -5)] = exDoc;
        }

    }

    typeof fncs.run_dir_scan_done == 'function' && fncs.run_dir_scan_done(startTime);
    
    
}

fncs.run_dir_scan_done = function (startTime) {


    console.log(' -- run_dir_scan done in -->', ( ( Date.now() - startTime) - 0) / 1000, 'seconds', '\nn', Object.keys(SqyDB_cache['users']).length, SqyDB_stats['users'].last_num, SqyDB_cache['users']["4090s1g6i8q7j9j7002"].surname, '\n -- running query');
    
    let startTime2 = Date.now();
    typeof fncs.run_query == 'function' && fncs.run_query(startTime2);

}

fncs.run_query = function(startTime2) {

    let response = {'count': 0, documents: [] };

    for ( const key in SqyDB_cache['users'] ) {

        // if (Object.hasOwnProperty.call(object, key)) {
        //     const element = object[key];
            
        // }
        // if ( SqyDB_cache['users'][key]._dob.indexOf('July') > -1 
        //      && ( 
                
        //         (SqyDB_cache['users'][key]._invoices.scholarship &&  SqyDB_cache['users'][key]._invoices.scholarship.invoice_pay_amount >= 4000 )
        //         ||
        //         ( SqyDB_cache['users'][key]._invoices.bursary && SqyDB_cache['users'][key]._invoices.bursary.invoice_pay_amount >= 4000 )
                
        //         ) ) {
        if ( SqyDB_cache['users'][key]._dob.indexOf('August') > -1 
             && ( 
                
                (SqyDB_cache['users'][key]._invoices.scholarship &&  SqyDB_cache['users'][key]._invoices.scholarship.invoice_pay_amount < 4000 )
                ||
                ( SqyDB_cache['users'][key]._invoices.bursary && SqyDB_cache['users'][key]._invoices.bursary.invoice_pay_amount < 4000 )
                
                ) ) {

            response.count++
            response.documents.push(SqyDB_cache['users'][key]);

        };

    }

    console.log(' -- run_query done in -->', ((Date.now() - startTime2) - 0) / 1000, 'seconds', '\nn', response.count, response.documents[2].surname, '-->', response.documents[2], '._dob' );
   
}
// main();
// main_scan();

fncs.run_dir_scan();