
const ROOT_DIR = import.meta.dir + '/../';

// const ROOT_DIR = import.meta.dir + '/../';

// const fs = require('fs'); 

// const _static_dir = `static`;
const _static_dir = `static`;

const ENV_VARS_path = `${ROOT_DIR}cp_backend/_configo_xRF/_config.json`;

let ENV_VARS = Bun.file(ENV_VARS_path);
ENV_VARS = await ENV_VARS.json();

// console.log('ENV_VARS ->', ENV_VARS );

export const config = {

    db_data_dir: `${ROOT_DIR}_d_data`,
    db_port: parseInt(ENV_VARS.db_port),
    db_cache_port: 5090,
    db_worker_port: 5060,

    dbn_prefix: "h1", // first host in the cluster
    db_node_limit: 100, // -- before we're done with 50k posts, users.. goroutine should be up straigt
    // @@ so erter and updaters woill check when it exceeds 200k via .dir.meta flie.. then
    // @@ moves writing ops to next folder..
    // @@ -- sme for caching.. meta var holds count etc...
    // -- think of solution before 200k...
    // "linux maximum number of files in a directory" --> for insights

    // next project is Golang (pointer, structs, maps etc, goroutine)
    // -- Hengout.. end
    db_comment_node_limit: 100,

    connection_node_limit: 5000,


    extra_nodes: 1,

    // @@ Array indexes to add to _id
    collection_index: {
        'LSSB_PINs': ['_fields.pin'],
        'LSSB_admin': ['_fields.username', '_fields.email', '$uid$'],
        'LSSB_users': ['_fields.username', '_fields.email', '_fields.nin', '_fields.lassra', '_fields.bank_account_number', '_fields.matric_tied_to_application' ],
        'LSSB_applications': ['_fields.matric_grant_year', '_fields.matric_no', '_fields.applicant_id', '_fields.application_num', '_fields.unique_id_grant_year_code', '$creator$', '$uid$'],
        'LSSB_grants': ['$creator$', '_fields.grant_type'],
        'LSSB_notifications': ['_id'],
        'LSSB_resources': ['_id', 'type'],
    },

    collection_id_helper : {
        'LSSB_admin': 'AD',
        'LSSB_users': 'US',
        'LSSB_applications': 'AP',
        'LSSB_grants': 'GR',
        'LSSB_PINs': 'PI',
        'LSSB_notifications': 'NO',
        '_collectives': 'CL'
    },

    exclude_scan: [ 'cpx_comments', 'connections', 'admin_report', 'test_node2', '_connections', "_comments", '_chats', '_notifications', '_admin_report'],

    join_collection_map: {
        applicants: 'LSSB_users',
    },

    // sort_collection: ['cross_store', 'cpx_entity', 'cpx_admins', 'cpx_posts', 'cpx_users', 'cpx_comments', 'cpx_orders'],
    sort_collection: ['LSSB_admin', 'LSSB_users', 'LSSB_applications', 'LSSB_grants', 'LSSB_PINs', 'LSSB_notifications' ],

    // additional_collections: ['_connections', "_comments", '_chats', '_notifications', '_admin_report'],

    additional_collections: ["_collectives", '_notifications', '_admin_report', 'LSSB_notifications'],

    // _comments ==> collectibles schools, state etc division


    // create_extra_collections
    connections_index_key_maps: {

        '$post_likes': '$post_likes',

        '$users_followers': '$users_followers',
        '$users_followings': '$users_followings',

        '$entity_linkup': '$entity_linkup', // @@ page followers and group joins
        // '$page_followers': '$page_followers',

        // '$group_members': '$group_members',
        // '$pages_user_follow' : '$pages_user_follow',
        // '$groups_user_joined' : '$groups_user_joined'


    },

}