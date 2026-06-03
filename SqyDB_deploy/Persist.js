// Persist

const Persist = {};


Persist.count = 0;

Persist.write = async function (options_) {

    const bytes = await Bun.write(options_.path_plus_item_id + '.json', JSON.stringify(options_.data));

    console.log('done writing -->', bytes);

    if (bytes > 0) {
        return 'done'
    }
};

// Worker thread:
self.addEventListener("message", async (event) => {

    try {

        // setTimeout(function () {

        //     console.log('Persist Message received ::: ---- >', event.data);

        // }, 100)

        // const work_id = event.data.job + '_' + Date.now();
        // const work_id = event.data.job + '_' + Date.now();
        // console.log('Persist Message received ::: ---- >', event.data.type, Persist[current_fnc]);

        let job = { ...event.data };

        const current_fnc = job.type;

        console.log('Persist Message received ::: ---- >', event.data.type, 'Persist[current_fnc]' );

        // SqyWorker.queue.set(work_id, job);
        let res = await Persist[current_fnc](job);

        if (res == 'done') {


            console.log(' Job done ---->');

            // self.postMessage({ msg: "job done" });

            process.exit();

            // -- delete job then call next
            // Persist.unset_job(current_job_key);

        }


    } catch (error) {

        console.log('error --- ::: -->', error );

        process.exit();
    }

});




setInterval(function () {

    Persist.count++;

    console.log(' Persist Worker running --- ::: -- >', process.pid, Persist.count);

    // self.postMessage({ msg: "job done", count:Persist.count });

}, 1000);
