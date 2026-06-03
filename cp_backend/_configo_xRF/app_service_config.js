
// const _site_dir =  'andro_www';
// const _site_dir =  'ibom';
const _site_dir =  'test_www';

// const ROOT_DIR = `${__dirname}`;
const ROOT_DIR = import.meta.dir + '/../';

// const fs = require('fs'); 

// const _static_dir = `static`;
const _static_dir = `static`;

const ENV_VARS_path = `${ROOT_DIR}_configo_xRF/_config.json`;

let ENV_VARS = Bun.file(ENV_VARS_path);

ENV_VARS = await ENV_VARS.json();

console.log('ROOT DIR ->', ROOT_DIR, ENV_VARS );


export let config = { 

    ROOT_DIR,

	ENV_VARS,

	app_server_port: ENV_VARS.app_server_port,// 1100,

	media_port: ENV_VARS.media_port,// 1100,

    app_service_controller_dir: ENV_VARS.app_service_controller_dir,

	_site_dir,
	_static_dir,

	// auth_expires: 240,// in secs.. 4 mins will be 4 * 60 == 240secs // use sockets to refresh auth via a auth key

	// auth_expires: 216000, //1800,// 30 in secs.. 60 mins will be 60 * 60 == 3600secs // for open_schol reg

	auth_expires: 3600,

	// db_url: `http://127.0.0.1:${'db_port'}/_sdb_`,
	// db_url: `http://127.0.0.1:8900/_sdb_`,
	// db_port: 8900,
	db_url: ENV_VARS.mode == "dev" ? ENV_VARS.db_url_dev : ENV_VARS.db_url,

	// media_uploads_dir: `${__dirname}/../../xx/cp_media_uploads_2023`,
	// video_uploads_dir: `${__dirname}/../../xx/cp_video_uploads_2023`,

	media_uploads_dir: `${ROOT_DIR}/../../LSSB_uploads`,

	// current_site_dir: `${__dirname}/../../${_static_dir}/${_site_dir}/`,
	// pages_dir: `${__dirname}/../../xx/`,
	pages_dir: `${ROOT_DIR}../../xx/`,
	
	// static_dir: `${__dirname}/../../xx/${_static_dir}`,

	// databases: ['SqyDB'],
    // allowedOriginLocal: '--l$#F!xx/',
	allowedOriginLocal: '--l$#F!LSSB.rn/LSSB.rx',
	allowedOriginApp: '--l$#F!LSSB.rn/LSSB.rx',
	allowedOrigins: ['--l$#F!LSSB.rn/LSSB.rx', '--l$#F!fPage/uico', 'http://cp.local', 'http://localhost:1100', 'http://localhost:3990', 'https://api1.christplatform.xyz', 'https://christplatform.xyz'] ,

	controller_dir: "cp_controllers"
};






// exports.config = config; 