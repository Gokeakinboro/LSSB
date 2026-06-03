
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
    db_worker_port: 5062,

    dbn_prefix: "h1", // first host in the cluster
    db_node_limit: 12000,
    extra_nodes: 1,

    count_index: {
        'LSSB_applicants': {
            total: 0,

        },
        'LSSB_applications': {
            total: 0,
            '_fields.grant_type': {},
        },
    },

    // @@ Array indexes to add to _id
    collection_index: {


        'LSSB_PINs': ['_fields.pin'],
        'LSSB_admin': ['_fields.username', '_fields.email', '$uid$'],
        'LSSB_applicants': ['_fields.username', '_fields.email', '_fields.nin', '_fields.lassra', '_fields.bank_account_number'],
        'LSSB_applications': ['_fields.matric_no', '_fields.application_num', '_fields.unique_id_grant_year_code', '$creator$', '$uid$'],
        'LSSB_grants': ['$creator$', '_fields.grant_type'],
        'LSSB_notifications': ['_id'],
        'LSSB_resources': ['_id', 'type'],

        // '_fields.grant_type',

        // -- as_id to options so get one by id knows to use a key as id
        // from the others collection in index
        // 'crossStore': ['$creator$'],
        // 'crossStore': ['$creator$'],
        // 'cpProfiles': ['$creator$', 'user_id'],
        // 'cpFeeds': [],
        // '$followers': ['self'],
        // 'cp_comments': ['_id', 'post_id'], // allows to index comments by ID

        // 'creek_submissions': ['type']
    },

    join_collection_map: {
        applicants: 'LSSB_applicants',
    },

    // sort_collection: ['crossStore', 'cpEntity', 'cpPosts', 'cpProfiles', 'cp_comments', 'creek_submissions'],
    sort_collection: ['LSSB_admin', 'LSSB_applicants', 'LSSB_applications', 'LSSB_grants', 'LSSB_PINs' ],

    create_extra_collections: [
        // '$postLikes', 
        // // '$pageLikes', 
        // '$postsUserLiked',
        // '$groupMembers',
        // '$groupsUserJoined',
        // '$postsUserCommentedOn',
        // '$followers', 
        // '$followings', 
        // '$views', //post or video was view with time
        // '$cp_comments'
    ],

    collection_x : [
        // '$postLikes', 
        // // '$pageLikes', 
        // '$postsUserLiked',
        // '$groupMembers',
        // '$groupsUserJoined', 
        // '$postsUserCommentedOn',
        // '$followers', 
        // '$followings', 
    ], //only index based on resource attached to em

}