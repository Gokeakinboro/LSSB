
SqyDB.db_ops.linkup_with_entity_ = async function (options) {

    try {


        // Options :: -> {
        //     connection_type: "linkup_with_entity",
        //     actorId: "11997V1Ve2K0k62832g4E4e0J2Vh1V1",
        //     subjectId: "11999V1VC3j5L6N965c9B9m9w7Vh1V1",
        //     db_action: "set_unset_connections",
        //     value: "{\"11997V1Ve2K0k62832g4E4e0J2Vh1V1\":\"2024-08-14T13:06:12.941Z\"}",
        //     value2: "{\"11999V1VC3j5L6N965c9B9m9w7Vh1V1\":\"2024-08-14T13:06:12.941Z\"}",
        //     collection: "",
        //   } 

        console.log('linkup Entity :: -->', options );


        return { msg: 'Working' }

        let updatedDoc = SqyDB_Cache['cpx_entity'][options.subjectId];

        let type = data._fields.entity_type;

        // let actorId = data.user_id || data.actorId

        let userDoc = SqyDB_Cache['cpx_users'][options.actorId];

        if (!updatedDoc || !updatedDoc._id) { return { msg: '404' } }


        connectionIndex['$entity_linkup'][options.subjectId] = connectionIndex['$entity_linkup'][options.subjectId] || {};

        if (connectionIndex['$entity_linkup'][options.subjectId].hasOwnProperty(options.actorId)) {
            return { msg: '400' }
        }

        updatedDoc.$connections$ = updatedDoc.$connections$ || {};

        updatedDoc.$connections$.linkups = updatedDoc.$connections$.linkups || 0;
        updatedDoc.$connections$.linkups++;

        let current_count = (parseInt(updatedDoc.$connections$.linkups / 100) + 1) * 100;

        let file_name = current_count;

        connectionIndex['$entity_linkup'][options.subjectId][options.actorId] = "" + file_name;

        // @@ persist main resource
        SqyDB.fncs.reCache_and_persist_updated_doc(updatedDoc, { collection: 'cpx_entity' })


        // @@ persist connection
        const persistWorker = new Worker("./connections_worker.js", {
            smol: true,
        });

        persistWorker.postMessage({

            config,
            fnc: 'persist_connection_value',
            id: options.subjectId,
            collection: '$entity_linkup',
            file_name,
            value: options.value
        });

        console.log('$entity_linkup :: ->', connectionIndex['$entity_linkup'], ' \n \n options.value -->', options.value);

        return { msg: 'OK' }



    } catch (error) {

        console.log(' Entity Linkup Err ->', error);
        return { msg: 'Error' }
    }

};



SqyDB.db_ops.unlinkup_with_entity = async function (options) {

    try {

        let updatedDoc = SqyDB_Cache['cpx_entity'][options.subjectId];

        if (!updatedDoc || !updatedDoc._id || !connectionIndex['$entity_linkup'][options.subjectId]) { return { msg: '404' } }

        // console.log(' kkk unlike post :: -->', connectionIndex['$entity_linkup'][options.actorId], options.subjectId, 'tolo --->>',
        //     connectionIndex['$entity_linkup'][options.actorId][options.subjectId]
        //   );

        // SqyDB_index[options.collection]._id[options.$where._id] = SqyDB_index[options.collection]._id[options.$where._id] || {};
        connectionIndex['$entity_linkup'][options.subjectId] = connectionIndex['$entity_linkup'][options.subjectId] || {}

        if (typeof connectionIndex['$entity_linkup'][options.subjectId][options.actorId] !== 'undefined') {

            SqyDB_Cache['cpx_entity'][options.subjectId].$connections$.linkups--;

            let file_name = connectionIndex['$entity_linkup'][options.subjectId][options.actorId];
            delete connectionIndex['$entity_linkup'][options.subjectId][options.actorId];

            // @@ persist main resource
            SqyDB.fncs.reCache_and_persist_updated_doc(SqyDB_Cache['cpx_entity'][options.subjectId], { collection: 'cpx_entity' })

            // @@ persist connection
            const persistWorker = new Worker("./connections_worker.js", {
                smol: true,
            });

            let dd = {

                fnc: 'unpersist_connection_value',
                id: options.subjectId,
                toRemoveId: options.actorId,
                collection: '$entity_linkup',
                file_name,
                config,
                // value: options.value
            };

            persistWorker.postMessage(dd);

            // persit_remove(dd);


            console.log(' unlink $entity_linkup :: ->', "connectionIndex['$entity_linkup']");

            return { msg: 'OK' }


        }

        return { msg: 'null' }




    } catch (error) {

        console.log('Like Post Err ->', error);
    }
};

