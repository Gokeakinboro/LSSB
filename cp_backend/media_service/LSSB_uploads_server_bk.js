import fs from 'node:fs';
// const config = require('../_configs/app_service_config.js');
// pm2 start --interpreter /bin/bun cp_a1.js


// pm2 start --interpreter /bin/bun cp_a1.js --node 1

// https://pm2.keymetrics.io/docs/usage/log-management/
// pm2 start --interpreter /bin/bun dnode.js 

// pm2 logs 4

// nano ~/.bashrc
// # add to ~/.bashrc
// export BUN_INSTALL="$HOME/.bun"
// export PATH="$BUN_INSTALL/bin:$PATH"

const { config } = await import('../_configo_xRF/app_service_config.js');

// const { API_processor } = await import('./_lib_/API_processor.js');

// const { long_API_processor } = await import('./_lib_/long_API_processor.js');


// const file_server = require('./_lib_/file_server');

// @@ Backend Headers

// const { backendHeaders } = await import('./_lib_/backendHeaders.js');

// console.log('in APPPO --- config -==-----<><><>>>>', config.ROOT_DIR);

/**
 * @@ The server - BackxMediaService
 */
const BackxMediaService = {};

BackxMediaService.api_hits = 0;

BackxMediaService.node = 0;

BackxMediaService.file_servers_hits = 0;

// @@ server isn't running yet.
BackxMediaService.server_running = !1;

// BackxMediaService.years_ = ['2024', '2025', '2026','2027','2028','2029','2030','2031','2032','2033','2034','2035'];
BackxMediaService.months_ = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

/**
 * @@ Handle URLs
 * 
 */

// const urlHandler = (req) => {

//     var theUrl = (req.connection.encrypted ? 'https' : 'http') + '://' + req.headers.host + req.url;
//     var url_parts = nodeUrlHelper.parse(theUrl, true);
//     return url_parts;

// };


/**
 * @@ BackxMediaService Request Processor
 * @@ -- This function handles request processing
 * @@ -- it determines if it should delegate request to fileservers
 * @@ -- or API endpoint processors
 * 
 */
BackxMediaService.fail_count = 0;


BackxMediaService.init = function () {

    // https://bun.sh/guides/util/import-meta-dir

    // https://medium.com/deno-the-complete-reference/node-js-vs-deno-vs-bun-vs-go-a-re-look-at-the-hello-world-performance-d90b76ad61a5
    // https://medium.com/deno-the-complete-reference/node-js-vs-deno-vs-bun-a-re-look-at-the-performance-when-serving-images-87a972c9257
    // https://bun.sh/guides/read-file/stream
    // https://bun.sh/guides/http/stream-file

    if (!fs.existsSync(`${config.media_uploads_dir}`)) {


        fs.mkdir(`${config.media_uploads_dir}`, (err) => {
            console.log('media uploads Dir created');
            // fs = null;
            // years 2024 - 2050
            for (let index = 2024; index <= 2050; index++) {

                fs.mkdir(`${config.media_uploads_dir}/${index}`, (err) => {

                    for (let indexm = 0; indexm < BackxMediaService.months_.length; indexm++) {

                        fs.mkdir(`${config.media_uploads_dir}/${index}/${BackxMediaService.months_[indexm]}`, (err) => {

                        });

                    }

                })

            }
        });
    }

    // console.log('config.media_port ->', config.media_port);
    // let add_port = parseInt(Bun.argv[Bun.argv.indexOf('--node') + 1]);

    // console.log(' Starting Server 00 ->', config.media_port, Bun.argv, ( parseInt(Bun.argv[Bun.argv.indexOf('--node') + 1]) - 1 ) );

    const server = Bun.serve({

        port: parseInt(config.media_port) + (parseInt(Bun.argv[Bun.argv.indexOf('--node') + 1]) - 1),
        // hostname: '127.0.0.1',
        async fetch(req) {

            const url = new URL(req.url);

            console.log('req --->', req.url, 'req', url.pathname );

            if (url.pathname.indexOf('/cpfl') > - 1) {

                // const basePath = config.pages_dir; // config.pages_dir
                // let is_page = false;
                url.pathname = url.pathname.replace('//cpfl/', '');
                let file_path = config.media_uploads_dir + '/' + url.pathname;
        
                // if (!(/\.([A-Z][0-9])$/i).test(url.pathname)) {
                // if (!(/\./i).test(url.pathname)) {
                //     file_path += '.html';
                // }

        
                let file = Bun.file(file_path);
        
                const file_exists = await file.exists(); // boolean;
        
                if (!file_exists) {
                    return new Response('null', { status: 404 });
                }
        
                return new Response(Bun.file(file_path));

            }

            // parse formdata at /action
            if (url.pathname === '/upload') {

                const d = new Date();
                let month_ = d.getMonth();
                let year_ = d.getFullYear();


                const formdata = await req.formData();
                const media_key = formdata.get('upload_key');
                let _name = formdata.get('upload_file_name');
                // const profilePicture = formdata.get('profilePicture');
                // if (!profilePicture) throw new Error('Must upload a profile picture.');
                // write profilePicture to disk
                const media_file = formdata.get(media_key);

                // await Bun.write('profilePicture.png', media_file );
                // return new Response("Success");

                // console.log('formdata -====>><<--->', formdata, Object.keys(formdata), formdata.entries().next() )
                // year_, BackxMediaService.years_[year_]


                let fa = _name.split('.'), l = fa.length, ext = fa[l - 1];
                _name = _name.split('.' + ext)[0] + "" + Date.now() + '.' + ext;
                _name = _name.split(' ').join('_');

                let path = `${year_}/${BackxMediaService.months_[month_]}/${_name}`;

                // console.log('formdata -====>><<--->', media_key, '---++---', media_file, '\n month --->', month_, BackxMediaService.months_[month_], '\n Year --->', '\n\n', formdata, '\n _name --==>>', _name, path);

                await Bun.write(`${config.media_uploads_dir}/${path}`, media_file);


                return new Response(
                    JSON.stringify({
                        success: true,
                        status: 200,
                        data: {
                            msg: 'ok',
                            files: [server.url + '/' + 'cpfl' + '/' + path],
                            file_name: _name
                        }
                    }),
                    {
                        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                        status: 200,
                        // status: API_response.status,
                    }
                );


            }

            return new Response("Not Found", { status: 404 });
        },
        error(error) {
            return new Response(`<pre>${error}\n${error.stack}</pre>`, {
                headers: {
                    "Content-Type": "text/html",
                },
            });
        },
    });

    console.log(`Listening on ${server.url}`);

    // @@ set 
    // Bun.write(config.ROOT_DIR, JSON.stringify({node_running: }) );

}

process.on("SIGINT", () => {
    console.log("Ctrl-C was pressed");
    process.exit();
});


BackxMediaService.init();

