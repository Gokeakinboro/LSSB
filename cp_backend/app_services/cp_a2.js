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

Backx.processReq = async function (req) {

    // @@ process necessary vars
    // ## === Process urls. Pull headers and method from the request

    // const { headers, method } = req;
    // const 
    // const url = urlHandler(req);
    const url = new URL(req.url);

    // console.log('Bun request ----->', url);

    /**
     * @@ If it's an API request
     * @@ -- run it by the API processor
     */
    if (url.pathname.indexOf('/endpoint') > -1) {

        // let backendHeaders = {};
        let startTime = Date.now();
        let API_response = await API_processor(req, url, backendHeaders, Backx.api_hits, config);

        console.log('72 nodex.js Vegas 3 Enpoint Req:', 'url', '\n \n API_response ==----> ', API_response, '\n', 'in ', (Date.now() - startTime ) / 1000 );

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
        
        return new Response( 'null', { status: 404 } );

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

        
        console.log('Serve file instead :', file_path , url);

        let file = Bun.file(file_path);

        const file_exists = await file.exists(); // boolean;

        if (!file_exists) {
            return new Response( 'null', { status: 404 } );
        }

        return new Response( Bun.file(file_path) );

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


};


Backx.init = function () {

    // https://bun.sh/guides/util/import-meta-dir

    // https://medium.com/deno-the-complete-reference/node-js-vs-deno-vs-bun-vs-go-a-re-look-at-the-hello-world-performance-d90b76ad61a5
    // https://medium.com/deno-the-complete-reference/node-js-vs-deno-vs-bun-a-re-look-at-the-performance-when-serving-images-87a972c9257
    // https://bun.sh/guides/read-file/stream
    // https://bun.sh/guides/http/stream-file

    // console.log('config.app_server_port ->', config.app_server_port);
    // let add_port = parseInt(Bun.argv[Bun.argv.indexOf('--node') + 1]);

    const server = Bun.serve({

        port: parseInt(config.app_server_port) + ( parseInt(Bun.argv[Bun.argv.indexOf('--node') + 1]) - 1 ),
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
    process.exit();
  });

  
Backx.init();

