

import { Glob } from "bun";

const glob = new Glob("*js");

const { utils } = await import('./utils.js');

const { SqyDB_Model } = await import('./SqyDB.Model.js');

const { Controller } = await import('./Controller.js');


const { config } = await import('../../_configo_xRF/app_service_config.js');


/**
 * @@ API_processor 
 * @@ processes API requests and responds appropriately
 */
let api_hits = 0;

let routes_controller_map = {};

export const Router = async () => { };

Router.process_req = async (reqObject) => {

    try {

        if (typeof reqObject.the_current_route !== 'string' || reqObject.the_current_route.length < 1) {
            return { success: false, statusCode: 400, data: { msg: 'Invalid Route' } }
        }

        // Map the Endpoint Function To call in the defined routes to
		// the endpointPath if it exists in the route else hit router 404;
		let isFound = routes_controller_map.hasOwnProperty(reqObject.the_current_route);
		let routeController = isFound ? routes_controller_map[reqObject.the_current_route] : routes_controller_map['404'] || routes_controller_map['_404'];
	
		// console.log( ' theRoute --> ', routes_controller_map, reqObject.the_current_route );

        // console.log( ' theRoute --> ', routeController );
	
		// let routeController_res = await routeController.controller(reqObject);
		return await routeController.controller.fn_(reqObject);

        // return routeController_res

    }
    catch (err) {

        console.log(' Router Error line 50 -->', err);

        return {
            success: false,
            resourceType: reqObject.the_current_route,
            statusCode: 500,
            data: { msg: 'A server error occured' }
        }

    }

};

Router.init = async () => {


    let r_list = [];

    // let routes_controller_map = {};
    let controllers_dir = `${config.ROOT_DIR}app_services/${config.app_service_controller_dir}`;

    // let controller_files = fs.readdirSync(controllers_dir);

    // console.log(' Initing Router --====++======= ', `${config.ROOT_DIR}app_services/${config.app_service_controller_dir}`);

    for (const file of glob.scanSync(controllers_dir)) {

        // console.log('file --=======+++--===>><<>>>>>', file);
        // https://stackoverflow.com/questions/39282253/how-can-i-alias-a-default-import-in-javascript
        const { theController } = await import(`${config.ROOT_DIR}app_services/${config.app_service_controller_dir}/${file}`)

        // console.log(' theController -===>', theController );

        routes_controller_map[file.slice(0, -3)] = { theController };

        r_list.push(file.slice(0, -3));
    }


    //   return

    // console.log('routes_controller_map -===>', routes_controller_map, r_list);

    let route_collections_map = {};

    // @@ initialize models && controllers
    r_list.forEach(route => {


        // @@ for each imported route options
        // @@ set a model 
        if (routes_controller_map[route].theController.collection) {

            routes_controller_map[route].theController.model = new SqyDB_Model({  // db: config._db,  
                collection: routes_controller_map[route].theController.collection,
                schema: routes_controller_map[route].theController.schema
            });

            // routes_controller_map[route].theController.model = {};
            // console.log('routes_controller_map ==--->', route, '--====-----> ', routes_controller_map[route].theController.collection );
            route_collections_map[route] = routes_controller_map[route].theController.collection;
        }

        if (typeof routes_controller_map[route].theController == 'function') {

            routes_controller_map[route].controller = {};
            routes_controller_map[route].controller.fn_ = routes_controller_map[route].theController;

            delete routes_controller_map[route].theController
        }

        else {

            // console.log(' 00 route -->', route, routes_controller_map[route].theController );

            routes_controller_map[route].controller = {};

            if (routes_controller_map[route].theController.controller) {
                routes_controller_map[route].controller.fn_ = routes_controller_map[route].theController.controller

            }
            else {
                routes_controller_map[route].controller = new Controller(routes_controller_map[route].theController);
            }

            delete routes_controller_map[route].theController
            // routes_controller_map[route].controller.fn_ = routes_controller_map[route].theController.controller || new Controller(routes_controller_map[route].theController );

            // console.log(' 00 route -->', route, routes_controller_map[route].controller );

        }

    });



    // console.log('routes_controller_map -===>', routes_controller_map, r_list);

};

Router.init();