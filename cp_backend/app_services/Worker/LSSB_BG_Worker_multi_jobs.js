// LSSB_BG_Worker.js

// import { resolve } from "bun";
import { unlink } from "node:fs/promises";

// self.onmessage = (event: MessageEvent) => {
//     console.log(event.data);
//     postMessage("world");
//   };
// setTimeout(function () { console.log('LSSB worker running --- ::: -- >') }, 800);
const SqyWorker = {};

SqyWorker.queue = new Map();

SqyWorker.job_pending = false;

SqyWorker.is_processing = false;

const SqyWorkerFncs = {};


SqyWorkerFncs.send_mail = async function (data) {

    return new Promise((resolve, reject) => {

        console.log(' now sending mail ::: -->', data);

        setTimeout(function () {


            console.log(' done sending mail ::: -->');

            resolve('done');

        }, 2000)

    })
}




SqyWorkerFncs.unset_job = async function (job_id) {


    // let _id = SqyDB_stats[options.collection].last_num + 'V' + SqyDB_stats[options.collection].last_node_dir + 'V' + _u.gen_id() + 'V' + config.dbn_prefix + 'V' + SqyDB.db_node;
    // num in folder / last node dir / id / db host / db_node
    // console.log('Persist time --->', updatedDoc );

    // @@ analyze updatedDoc._id to know where to Cache data
    // let _id_array = _id.split('V');

    SqyWorker.queue.delete(job_id);

    // console.log('_id_array --->>>>', _id_array, config.dbn_prefix);

    // @@ if this data should be operated on by this node 
    // @@ -- also check if the collection for this category was cached later 
    // if (_id_array[4] == SqyDB.db_node) {

    // SqyDB_Cache[options.collection][updatedDoc._id] = updatedDoc;

    let path_plus_item_id = `./Worker/jobs/${job_id}`;

    // const path = "/path/to/file.txt";
    await unlink(`${path_plus_item_id}.json`);
    // return ''


};


// Worker thread:
self.addEventListener("message", async (event) => {

    // setTimeout(function () {

    console.log('LSSB worker Message received ::: ---- >', event.data);

    const work_id = event.data.job + '_' + Date.now();

    let job = { work_id, ...event.data };

    SqyWorker.queue.set(work_id, job);

    await Bun.write(`./Worker/jobs/${work_id}.json`, JSON.stringify(job));

    runJob();



    // }, 800);

});

self.onclose = (event) => {

    setTimeout(async function () {

        console.log('worker closed ----', event);
        // postMessage("world");
        // await Bun.write('./runnin.txt', 'true');
        process.exit();

    }, 800);
};


const runJob = async function () {

    if (SqyWorker.is_processing) {

        SqyWorker.job_pending = true;
        return
    }

    let u = 0, nn = SqyWorker.queue.size;

    let queueItems = [];


    SqyWorker.queue.forEach(function (value, key) {

        // text += key + ' = ' + value;
        queueItems.push(key);
    })

    console.log(' now running jobs ::: Queue size -->', nn, 'queueItems -->', queueItems);

    // setTimeout(function () { console.log('LSSB worker running --- ::: -- >', nn ) }, 800);

    let _re_call = async function () {

        // all done
        if (nn == 0) {

            SqyWorker.job_pending = false;

            console.log('All JOBs done --------<<>>> checking for jobs in 20 secs ---> ');

            // wait for 20 seconds ... check for new work
            let check20 = setTimeout(async function () {

                runJob();
                clearTimeout(check20);

            }, 20000);
            return
        }

        // run
        else {


            // if (u > 0) {

            console.log(' now starting job ---- --->', n, queueItems[u]  );


            // u++;
            // _re_call();
            // }
            // List all Entries
            let current_job_key = queueItems[u],
                current_job_data = SqyWorker.queue.get(current_job_key);

            if (typeof SqyWorkerFncs[current_job_data.job] == 'function') {

                let res = await SqyWorkerFncs[current_job_data.job](current_job_data.data);

                if (res == 'done') {


                    console.log('now calling next job in Queue ---->')

                    // -- delete job then call next
                    SqyWorkerFncs.unset_job(current_job_key);

                }

                // let unsetTimer = setTimeout(async function () {

                u++;
                _re_call();
                // clearTimeout(unsetTimer);

                // }, 150);

            }

            else {

                console.log('Job miss..... invalid fnc.. deleting from Queue', current_job_key)

                // -- delete job then call next
                SqyWorkerFncs.unset_job();

                let unsetTimer = setTimeout(async function () {

                    u++;
                    _re_call();
                    clearTimeout(unsetTimer);

                }, 200);


            }


            // console.log(' now running jobs in ::: Queue -->', nn);

        }

    };

    _re_call();


};




setTimeout(function () {

    console.log('LSSB worker running --- ::: -- >')

    runJob();

}, 800);

setInterval(function () {

    console.log('LSSB worker --- ::: -- >', SqyWorker.queue.size, process.pid);
    // process.exit();
}, 2000);



