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

const { API_processor } = await import('./_lib_/API_processor.js');

const { long_API_processor } = await import('./_lib_/long_API_processor.js');

// @@ -- Worker 
// const worker = new Worker("./Worker/LSSB_BG_Worker.js");

// const file_server = require('./_lib_/file_server');

// @@ Backend Headers

const { backendHeaders } = await import('./_lib_/backendHeaders.js');

// console.log('in APPPO --- config -==-----<><><>>>>', config.ROOT_DIR);

/**
 * @@ The server - Backx
 */
const Backx = {};

Backx.api_hits = 0;

Backx.node = 0;

Backx.file_servers_hits = 0;

// @@ server isn't running yet.
Backx.server_running = !1;

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
 * @@ Backx Request Processor
 * @@ -- This function handles request processing
 * @@ -- it determines if it should delegate request to fileservers
 * @@ -- or API endpoint processors
 * 
 */
Backx.fail_count = 0;

Backx.months_ = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

Backx.processReq = async function (req) {

    try {

        // @@ process necessary vars
        // ## === Process urls. Pull headers and method from the request

        // const { headers, method } = req;
        // const 
        // const url = urlHandler(req);
        const url = new URL(req.url);

        console.log(' >> -- >> Bun request -----> ', 'url', url.pathname, url.pathname.indexOf('/long_fnc') > -1);

        /**
         * @@ If it's an API request
         * @@ -- run it by the API processor
         */

        if (url.pathname.indexOf('/long_fnc') > -1) {


            // setTimeout(function () {
            let startTime = Date.now();

            let API_response = await long_API_processor(req, url, backendHeaders, Backx.api_hits);

            return new Response(
                JSON.stringify(API_response),
                {
                    headers: backendHeaders.apiHeaders, //{'Content-Type': 'application/json'},
                    //    status: API_response.statusCode,
                    status: 200
                }
            );

            // }, 300)

            // return

        }

        else if ( url.pathname.indexOf('/batch') > -1 ) {

            // const d = new Date();
            // let month_ = d.getMonth();
            // let year_ = d.getFullYear();

            console.log('Disable --->>>>', url.pathname );

            const formdata = await req.formData();

            if (!formdata || !formdata.get('update_type')) {

                // formdata.get('update_type'); --- //

                return new Response(
                    
                    JSON.stringify({
                        success: false,
                        status: 400,
                        error: {
                            msg: 'Missing formdata or update_type',
                        }
                    }),
                    {
                        headers: backendHeaders.apiHeaders, //{'Content-Type': 'application/json'},
                        //    status: API_response.statusCode,
                        status: 400,
                    }
                );


            }

            
            const media_key = formdata.get('upload_key');
            let _name = formdata.get('upload_file_name');
            // const profilePicture = formdata.get('profilePicture');
            // if (!profilePicture) throw new Error('Must upload a profile picture.');
            // write profilePicture to disk
            const media_file = formdata.get(media_key);

            // await Bun.write('profilePicture.png', media_file );
            // return new Response("Success");

            console.log('formdata media_file -====>><<--->', media_file, _name , media_key, formdata.get('update_type') );

            // console.log('formdata -====>><<--->', formdata, Object.keys(formdata), formdata.entries().next() )
            // year_, Backx.years_[year_]

            let fa = _name.split('.'), l = fa.length, ext = fa[l - 1];
            _name = _name.split('.' + ext)[0] + "" + Date.now() + '.' + ext;
            _name = _name.split(' ').join('_');

            // let path = `${year_}/${Backx.months_[month_]}/${_name}`;
            let path = `${_name}`;

            // console.log('formdata -====>><<--->', media_key, '---++---', media_file, '\n month --->', month_, Backx.months_[month_], '\n Year --->', '\n\n', formdata, '\n _name --==>>', _name, path);

            await Bun.write(`${config.media_uploads_dir}/${path}`, media_file);

            // @@ lunch worker
            const persistWorker = new Worker("./Worker/batch_worker.js", {
                smol: true,
            });

            persistWorker.postMessage({

                fnc: 'run_batch_on_db_from_file',
                file_path: `${config.media_uploads_dir}/${path}`,
                update_type: formdata.get('update_type'),
                // collection: options_.collection,
                // clientId: options_.clientId,
                // config,
                // inDir: config.db_data_dir

            });

            return new Response(

                JSON.stringify({
                    success: true,
                    status: 200,
                    data: {
                        msg: 'ok',
                        files: `${config.media_uploads_dir}/${path}`,
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

        else if (url.pathname.indexOf('/endpoint') > -1) {

            // let backendHeaders = {};
            let startTime = Date.now();
            // let API_response = await API_processor(req, url, backendHeaders, Backx.api_hits, config, worker);
            let API_response = await API_processor(req, url, backendHeaders, Backx.api_hits, config);

            // console.log('72 Bunx.js Vegas 3 Enpoint Req:', 'url', '\n \n API_response ==----> ', API_response, '\n', 'in ', (Date.now() - startTime) / 1000);

            // console.log('110 cp_a1.js Vegas 3 Enpoint Req:', 'url', '\n \n API_response ==----> ', API_response, '\n', 'in ', (Date.now() - startTime) / 1000);

            if (API_response.data && API_response.data.msg == 'Retry$') {

                Backx.fail_count++;

                // console.log('115 cp_a1.js --- Request 00 ---=========><<<>>>>>> ', Backx.fail_count);
            }

            return new Response(
                JSON.stringify(API_response),
                {
                    headers: backendHeaders.apiHeaders, //{'Content-Type': 'application/json'},
                    //    status: API_response.statusCode,
                    status: API_response.status,
                }
            );



        }

        else {

            // return new Response( 'null', { status: 404 } );

            // console.log('Serve file instead:', url);
            //  file_server(url.pathname, res);
            // res.end('file');
            const basePath = config.pages_dir; // config.pages_dir
            // let is_page = false;
            let file_path = basePath + url.pathname;

            // if (!(/\.([A-Z][0-9])$/i).test(url.pathname)) {
            if (!(/\./i).test(url.pathname)) {
                // contentType = mimeTypes[ext] || 'application/octet-stream';
                // is_page = true;
                file_path += '.html';
            }


            console.log('Serve file instead :', file_path, url);

            let file = Bun.file(file_path);

            const file_exists = await file.exists(); // boolean;

            if (!file_exists) {
                return new Response('null', { status: 404 });
            }

            return new Response(Bun.file(file_path));

            // Bun.serve({
            //     port: 3000,
            //     fetch(request) {
            //         const fp = basePath + new URL(request.url).pathname;
            //         try {
            //             return new Response(Bun.file(fp));
            //         } catch (e) {
            //             return new Response(null, { status: 404 });
            //         }
            //     },
            // });


        }

    } catch (error) {

        console.log('Bun error ----------->>>', error);

        return new Response(
            JSON.stringify({
                success: false,
                status: 400,
                error: {
                    msg: 'An error occurred',
                }
            }),
            {
                headers: backendHeaders.apiHeaders, //{'Content-Type': 'application/json'},
                //    status: API_response.statusCode,
                status: 400,
            }
        );

    }


};


Backx.init = function () {

    // https://bun.sh/guides/util/import-meta-dir

    // https://medium.com/deno-the-complete-reference/node-js-vs-deno-vs-bun-vs-go-a-re-look-at-the-hello-world-performance-d90b76ad61a5
    // https://medium.com/deno-the-complete-reference/node-js-vs-deno-vs-bun-a-re-look-at-the-performance-when-serving-images-87a972c9257
    // https://bun.sh/guides/read-file/stream
    // https://bun.sh/guides/http/stream-file

    // console.log('config.app_server_port ->', config.app_server_port);
    // let add_port = parseInt(Bun.argv[Bun.argv.indexOf('--node') + 1]);

    // console.log(' Starting Server 00 ->', config.app_server_port, Bun.argv, ( parseInt(Bun.argv[Bun.argv.indexOf('--node') + 1]) - 1 ) );

    const server = Bun.serve({

        port: parseInt(config.app_server_port) + (parseInt(Bun.argv[Bun.argv.indexOf('--node') + 1]) - 1),
        // hostname: '127.0.0.1',
        fetch(req) {

            // console.log('req --->', req.url., req );
            // let Responder =  new Response;
            return Backx.processReq(req);

            //   throw new Error("woops!"); 
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
    // worker.terminate(); 
    process.exit();
});


// worker.addEventListener("close", event => {
//     worker.terminate(); 
//     console.log("worker is being closed");
// });


Backx.init();

