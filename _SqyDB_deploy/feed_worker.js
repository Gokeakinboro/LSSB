// feed_worker
// const { config } = await import('./_config.js');

// const { config } = await import('../cp_backend/_configo_xRF/app_service_config.js');


const _self = { db_url: 'http://localhost:5011' };

// _self.db_url = config.db_url.replace('$NODE$', `${Bun.argv[Bun.argv.indexOf('--node') + 1]}`);

// _self.db_url = config.db_url.replace('$NODE$', `1`);
// _self.db_url = _self.db_url.replace('ws:', 'http:');


const hit_db = async function (options) {

    // let collection = this.collection;

    // console.log('now getting on --->', collection);
    // options.collection = collection;
    options.db_action = options.db_action || 'get';

    // @@ -- HTTP set responder -- to processing mode
    const response = await fetch(_self.db_url, {
        method: "POST",
        body: JSON.stringify(options),
        headers: { "Content-Type": "application/json" },
    });

    const body = await response.json();

    return body.response


}


export let feed_worker = async function () {

    //  let res = await hit_db({
    //     $where: {},
    //     collection: 'cpPosts'
    //  });
    // console.log(' Sqy Feed Worker 00 +++----====__>', _self.db_url, '\n config2 ::', config );

    // console.log(' Sqy Feed Worker Res 00 +++----====__>', res );

    // @@ for each users... for each posts

};