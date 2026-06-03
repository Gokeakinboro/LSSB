
// const Router = require('./Router');
// const utils = require('./utils');
const { config } = await import('../../_configo_xRF/app_service_config.js');

const { Router } = await import('./Router.js');
const { utils } = await import('./utils.js');

/**
 * @@ 2. Router
 * @@ .. Pol
 */
let api_hits = 0;
export const API_processor = async (req, url, backendHeaders, numHits, config, worker) => {

    backendHeaders = backendHeaders || {};

	try {

		let startTime = Date.now();

		api_hits++;
		// console.log('in API_processor 23 -- API hit!', api_hits, 'url -->', url.pathname.split('endpoint/')[1] ); //processor

		// let newReqObject = { node };
		let newReqObject = {};
		let finalData, routerResponse, finalHeaders;

        

		/**
		 * @@ 1. check passage access.. is it from a trusted source (domain and accept in  header)
		 * @@ 2. prepare authentication
		 * @@ 3. extract payload data
		 * @@ 4. prep new request object for controller
		 * @@ 5. send newReq to controller for processing
		 * @@ 6. return response from controller
		 */

		/**
		 * @@ 
		 * @@ 1. Passage access
		 */
		let newReqHeader = await utils.reqHeadProcessor(req);

		// console.log( 'newReqHeader -->', newReqHeader, 'url:', 'url', '\n \n --- ' );

		// // @@ return if no passage granted
		if ( !newReqHeader.allow_passage ) {

			// --===== console.log('unallowed pass!');
            finalData = null; routerResponse = null; finalHeaders = null;
			return { success: !1, statusCode: 401, error: { msg: 'Passage Unallowed' } }

			// Passage Unallowed from node ::: --->>> ${Bun.argv[Bun.argv.indexOf('--node') + 1]}`

		}

		

		/**
		 * @@ 
		 * @@ 3. get payload fromreq
		 */
		let reqPayload = await utils.getPayload(req, newReqHeader);


		// // @@ -- 
        // console.log('reqPayload d --90 -->', reqPayload );

		newReqObject.headers = newReqHeader;
		newReqObject.payloadData = reqPayload;
		newReqObject.ops = newReqHeader.ops;



		/**
		 * @@ 
		 * @@ 4. Append any files to data body -- store files in newReqObject.files
		 */
		// newReqObject = utils.append_files_to_body(newReqObject, req); 
        // ---- 

		// @@ Auth
		newReqObject.auth = reqPayload.$k || newReqHeader.auth || null;

		newReqObject.auth_expires =  config.auth_expires;

		// // @@ setting queries
		newReqObject.$query = reqPayload.$query || {};

		newReqObject.auth = reqPayload.$k || newReqHeader.auth || null;
		


		// console.log( 'reqPayload --->', reqPayload, '.body', '',  newReqObject );

		if ( reqPayload.body ) {

			// console.log( 'newReqObject --->', newReqObject );

			if (reqPayload.body.parse_query) {

				newReqObject.$query = JSON.parse( reqPayload.body.$query );

				delete reqPayload.body.parse_query;
				delete reqPayload.body.$query;

			}

			newReqObject.auth = reqPayload.body.$k;

			delete reqPayload.body.$k
		}


		// @@ Append URL for more work
		newReqObject.url = url || {};


		// @@ delete __k
		delete newReqObject.payloadData.__k;
		delete newReqObject.payloadData.$k;
		delete newReqObject.payloadData.$query;

		reqPayload = null;

		// // @@ Settiing the_current_route from a subString of the url
		// // @@ Purifying urls
		url.pathname = url.pathname.replace(/\/\//g, '/');

		newReqObject.the_current_route = url.pathname.split('/endpoint')[1].substring(1);

		// console.log(' newReqObject 00 -->', newReqObject );

        // return { status: 200, success:true, data: { msg: `API HIT ${api_hits} in ${(Date.now() - startTime) } milli seconds ` } }

		// // return 
		newReqObject.worker = worker;

		// // @@ process via Router
		routerResponse = await Router.process_req(newReqObject);

		// finalData = JSON.stringify(routerResponse);

		// console.log('API_process 137 router res_  -->', routerResponse, 'newReqObject',`API HIT ${api_hits} in ${(Date.now() - startTime) } milli seconds ` ); 

		// /**
		//  * @@ 6. Return response from controller
		//  * @@ processes API requests and responds appropriately
		//  */
		// res.writeHead(routerResponse.statusCode, backendHeaders.apiHeaders);
		return routerResponse


		// /**
		//  * @@ End with data from endpoint to be consume
		//  */
		// res.end(finalData);

	}
	catch (err) {
		console.log('err API processor -->', err);
	}

};

