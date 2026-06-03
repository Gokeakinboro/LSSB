// connection_functions

export const connection_functions = {};





// Cache the first 10 comments for this resource...
// -- send a worker to queue the next 100 afterwards
connection_functions.add_comment = async function (_Cache, _commentsCache, _commentsIndex, _Connections, admin_report, options) {

    try {

        // let userToFollowDoc = _Cache['cpx_users'][options.subjectId]; // @@ -- //

        let config = options.config;
        // let gen_id = options.gen_id;
        delete options.config;
        delete options.gen_id;

        // if (!options || !options.comment || !options.comment.resourceId) { return { msg: '400' } }

        let resourceDoc = _Cache[options.parent_resource_collection][options.comment.resourceId]; // @@ -- //

        if (!resourceDoc) { return { msg: 'Resource 404' } }

        // commentsIndex[options.comment.resourceId] = commentsIndex[options.comment.resourceId] || {};

        // _commentsCache[options.comment.resourceId] = _commentsCache[options.comment.resourceId] || {};

        // console.log('commentsIndex -->', 'commentsIndex',  resourceDoc );



        // @@ generate and id for this resource --- // --- 00 --- //
        // -- Yostorio -- //
        resourceDoc.$connections$.comments_count = resourceDoc.$connections$.comments_count || 0;
        resourceDoc.$connections$.comments_count++;

        resourceDoc.$extras$.comments_track = resourceDoc.$extras$.comments_track || { last_num: config.db_comment_node_limit + 1, last_node_dir: 1 };
        // resourceDoc.$extras$.comments_track.last_count = 0;
        // resourceDoc.$extras$.comments_track.last_node_dir = 0;


        resourceDoc.$extras$.comments_track.last_num--;

        if (resourceDoc.$extras$.comments_track.last_num === 0) {

            resourceDoc.$extras$.comments_track.last_num = config.db_comment_node_limit;
            resourceDoc.$extras$.comments_track.last_node_dir++;

        }


        let _id = '';
        // let node_limit = config.db_comment_node_limit;

        function check_id() {

            // let _id = dbn_prefix + _u.preceeder_(last_num, 4) + _u.gen_id() + _last_node_dir;
            // if () {}
            // Num in folder / node folder / id / host id = dbn_prefix /  node on host
            // let _id = (config.db_node_limit - resourceDoc.$connections$.comments_count) + 'V' + '1' + 'V' + gen_id() + 'V' + config.dbn_prefix + 'V' + options.db_node;
            let col_pre = config.collection_id_helper && config.collection_id_helper['_comments'] ? config.collection_id_helper['_comments'] : "iddd";
            let _id = col_pre + 'V' + resourceDoc.$extras$.comments_track.last_num + 'V' + resourceDoc.$extras$.comments_track.last_node_dir + 'V' + resourceDoc._id + 'V' + config.dbn_prefix + 'V' + options.db_node;


            // if (commentsIndex[options.comment.resourceId][_id]) {

            //     _id = check_id(_id)
            // }


            // else {
            //     return _id;
            // }

            return _id;

        };

        _id = check_id();


        // console.log('Comment ID : --> ', _id, _id.split('V') );

        // Comment ID : -->  CMV42V3V4998V1VH3s7h3U7x4h8J2s9m4Vh1V1Vh1V1 [ "CM", "42", "3", "4998", "1",
        //     "H3s7h3U7x4h8J2s9m4", "h1", "1", "h1", "1"
        //   ]

        // return { msg: 'Error' }

        // @@ set data id
        options.comment._id = _id;

        // kokb 

        // @@ controller sorts each results of 10s by 
        options.comment['$t$'] = Date.now();

        // commentsIndex[options.comment.resourceId][_id] = 'options.comment';
        // @@ for now a Comments Cache and Comments Index

        // -- can holder 500k comments

        // @@ we'd launch better comments aggregation system later

        // @@ for now.. comments are per resource ID.. so that when 

        _commentsCache[_id] = options.comment;


        _commentsIndex[options.comment.resourceId] = _commentsIndex[options.comment.resourceId] || []
        // _commentsIndex[options.comment.resourceId][_id] = '-';
        _commentsIndex[options.comment.resourceId].unshift(_id);

        // @@ maybe pop over 100 comments --- have a background cache load more when the 50th is requested for this id

        // @ doesn't male sense to load comments in cache when in practice they all won't be read..

        // -- Apply intelligent caching system for main resources too..

        // -- users who haven't logged in in 2 years don't need their details in cache..

        // -- 


        admin_report.report.comments_count = admin_report.report.comments_count || 0;
        admin_report.report.comments_count++;

        resourceDoc.$comments = resourceDoc.$comments || [];

        resourceDoc.$comments.unshift(options.comment);

        if (resourceDoc.$comments.length > 3) { resourceDoc.$comments.pop(); }

        // console.log( ' add_comment :: ->', options  );
        // let current_count = (parseInt(resourceDoc.$connections$.comments_count / 20) + 1) * 20;

        // let file_name = current_count;

        console.log(' add_comment -->', options);

        // return { msg: '400' }
        // return { msg: 'Error' }

        // @@ persist main resource
        // SqyDB.fncs.reCache_and_persist_updated_doc(resourceDoc, { collection: 'cpx_posts' });

        // @@ persist connection
        const persistWorker = new Worker("./db_worker.js", {
            smol: true,
        });

        persistWorker.postMessage({

            dir: options.dir,
            fnc: 'persist_comment',
            commentId: options.comment._id,
            authorId: options.comment.author._id,
            comment: options.comment,
            admin_report,
            resourceDoc,
            resourceId: resourceDoc._id,
            resource_collection: options.parent_resource_collection,
            _date_: options.comment.$created_on$

        });

        // const commPersistWorker = new Worker("./comments_worker.js", {
        //     smol: true,
        // });

        // commPersistWorker.postMessage({

        //     config,
        //     fnc: 'persist_comment',
        //     resourceId: options.comment.resourceId,
        //     commentId: _id,
        //     // collection: '$users_followers',
        //     comment: JSON.stringify(options.comment),
        //     // value: options.value
        // });

        return { msg: 'OK' }



    } catch (error) {

        console.log('Add comm error Err ->', error);
        return { msg: 'Error' }
    }

};







connection_functions.follow_user = async function (_Cache, _Connections, admin_report, options) {


    try {


        let user_to_follow_data = _Cache['cpx_users'][options.subjectId];

        let actorId = options.actorId;

        let acting_user_data = _Cache['cpx_users'][actorId];

        // let config = options.config;
        // let gen_id = options.gen_id;
        // delete options.config;

        // console.log(' follow user ran ran  :: ---> ', 'type', '\n kook --->', options );
        // return {msg: 'Working' }

        if (user_to_follow_data && user_to_follow_data._id) {

            user_to_follow_data.$connections$ = user_to_follow_data.$connections$ || {};
            user_to_follow_data.$connections$.followers = user_to_follow_data.$connections$.followers || 0;
            user_to_follow_data.$connections$.followers++;


            user_to_follow_data.$extras$.user_followers_track = user_to_follow_data.$extras$.user_followers_track || { last_num: 0, last_node_dir: 1, last_node_dir_count: 1 };
            // user_to_follow_data.$extras$.user_followers_track.last_count = 0;
            // user_to_follow_data.$extras$.user_followers_track.last_node_dir = 0;

            user_to_follow_data.$extras$.user_followers_track.last_num++;

            if (user_to_follow_data.$extras$.user_followers_track.last_num === options.connection_node_limit + 1) {

                user_to_follow_data.$extras$.user_followers_track.last_num = 0;
                user_to_follow_data.$extras$.user_followers_track.last_node_dir++;

            }


            // @@ -- Acting user... followings

            acting_user_data.$connections$ = acting_user_data.$connections$ || {};
            acting_user_data.$connections$.followings = acting_user_data.$connections$.followings || 0;
            acting_user_data.$connections$.followings++;


            acting_user_data.$extras$.user_followings_track = acting_user_data.$extras$.user_followings_track || { last_num: 0, last_node_dir: 1, last_node_dir_count: 1 };
            // acting_user_data.$extras$.user_followings_track.last_count = 0;
            // acting_user_data.$extras$.user_followings_track.last_node_dir = 0;

            acting_user_data.$extras$.user_followings_track.last_num++;

            if (acting_user_data.$extras$.user_followings_track.last_num === options.connection_node_limit + 1) {

                acting_user_data.$extras$.user_followings_track.last_num = 0;
                acting_user_data.$extras$.user_followings_track.last_node_dir++;

                acting_user_data.$extras$.user_followings_track.last_node_dir_count++;

            }


            // @@ --- persist straight up
            // let options = {
            //     collection: 'cpx_entity'
            // };

            // @@ update admin report as well...
            let _date_ = new Date();
            _date_ = _date_.toISOString();


            // @@ set indexes -- == --- //  00 //
            _Connections.users_followers = _Connections.users_followers || {};
            _Connections.users_followers[options.subjectId] = _Connections.users_followers[options.subjectId] || {};
            _Connections.users_followers[options.subjectId][actorId] = _date_;

            _Connections.users_followings = _Connections.users_followings || {};
            _Connections.users_followings[actorId] = _Connections.users_followings[actorId] || {};
            _Connections.users_followings[actorId][options.subjectId] = _date_;


            _Cache['cpx_users'][options.subjectId] = user_to_follow_data;
            _Cache['cpx_users'][actorId] = acting_user_data;


            // @@ number of follows and likes
            admin_report.report.connections_count = admin_report.report.connections_count || 0;
            admin_report.report.connections_count += 2;

            // @@ persist connection -- / -- / 
            // @@ persist connections for Entity...
            // let _date_ = new Date();
            // _date_ = _date_.toISOString();

            // console.log(' follow user ran ran  :: ---> ', type, '\n kook --->', options, user_to_follow_data , acting_user_data );


            const persistWorker = new Worker("./db_worker.js", {
                smol: true,
            });

            persistWorker.postMessage({

                dir: options.dir,
                fnc: 'persist_user_follow',
                subjectId: options.subjectId,
                subjectId_track: user_to_follow_data.$extras$.user_followers_track,
                actorId: options.actorId,
                actorId_track: acting_user_data.$extras$.user_followings_track,
                admin_report,
                user_to_follow_data,
                acting_user_data,
                _date_

            });


            return { msg: 'OK' }


        }

        return { msg: 'Error' }

    } catch (error) {
        console.log(' error :: ---> ', error);
        return { msg: 'Error' }
    }

};



connection_functions.unfollow_user = async function (_Cache, _Connections, admin_report, options) {


    try {


        let user_to_follow_data = _Cache['cpx_users'][options.subjectId];

        let actorId = options.actorId;

        let acting_user_data = _Cache['cpx_users'][actorId];

        // console.log(' linkup ran  :: ---> ', type, '\n kook --->', options  );
        // return {msg: 'Working' }

        if (user_to_follow_data && user_to_follow_data._id) {

            user_to_follow_data.$connections$ = user_to_follow_data.$connections$ || {};
            user_to_follow_data.$connections$.followers = user_to_follow_data.$connections$.followers || 0;
            user_to_follow_data.$connections$.followers--;


            acting_user_data.$connections$ = acting_user_data.$connections$ || {};
            acting_user_data.$connections$.followings = acting_user_data.$connections$.followings || 0;
            acting_user_data.$connections$.followings--;


            // @@ --- persist straight up
            // let options = {
            //     collection: 'cpx_entity'
            // };

            // @@ update admin report as well...


            // @@ set indexes -- == --- //  00 //
            _Connections.users_followers = _Connections.users_followers || {};
            _Connections.users_followers[options.subjectId] = _Connections.users_followers[options.subjectId] || {};
            delete _Connections.users_followers[options.subjectId][actorId];

            _Connections.users_followings = _Connections.users_followings || {};
            _Connections.users_followings[actorId] = _Connections.users_followings[actorId] || {};
            delete _Connections.users_followings[actorId][options.subjectId];


            _Cache['cpx_users'][options.subjectId] = user_to_follow_data;
            _Cache['cpx_users'][actorId] = acting_user_data;


            // @@ number of follows and likes
            admin_report.report.connections_count = admin_report.report.connections_count || 0;
            admin_report.report.connections_count -= 2;

            // @@ persist connection -- / -- / 
            // @@ persist connections for Entity...
            // let _date_ = new Date();
            // _date_ = _date_.toISOString();

            const persistWorker = new Worker("./db_worker.js", {
                smol: true,
            });

            persistWorker.postMessage({

                dir: options.dir,
                fnc: 'unpersist_user_follow',
                subjectId: options.subjectId,
                actorId: options.actorId,
                admin_report,
                acting_user_data,
                user_to_follow_data,
                subject_dir_count: user_to_follow_data.$extras$.user_followers_track.last_node_dir_count,
                actor_dir_count: acting_user_data.$extras$.user_followings_track.last_node_dir_count

            });


            return { msg: 'OK' }


        }

        return { msg: 'Error' }

    } catch (error) {
        console.log(' error :: ---> ', error);
        return { msg: 'Error' }
    }

};







connection_functions.linkup_with_entity = async function (_Cache, _Connections, admin_report, options) {


    try {


        let entityData = _Cache['cpx_entity'][options.subjectId];

        let type = options.type;

        let actorId = options.actorId;

        let userData = _Cache['cpx_users'][actorId];

        // console.log(' linkup ran  :: ---> ', type, '\n kook --->', options  );
        // return {msg: 'Working' }

        if (entityData && entityData._id) {

            entityData.$connections$ = entityData.$connections$ || {};

            entityData.$connections$.linkups = entityData.$connections$.linkups || 0;

            entityData.$connections$.linkups++;


            entityData.$extras$.linkup_track = entityData.$extras$.linkup_track || { last_num: 0, last_node_dir: 1, last_node_dir_count: 1 };

            entityData.$extras$.linkup_track.last_num++;

            if (entityData.$extras$.linkup_track.last_num === options.connection_node_limit + 1) {

                entityData.$extras$.linkup_track.last_num = 0;
                entityData.$extras$.linkup_track.last_node_dir++;

                entityData.$extras$.linkup_track.last_node_dir_count++;

            }

            // @@ --- persist straight up
            // let options = {
            //     collection: 'cpx_entity'
            // };

            // @@ update admin report as well...

            // let current_count = (parseInt(d.$connections$.linkups / 100) + 1) * 100;
            // let entity_file_name = current_count;

            let user_connection_persist_collection = "groups_user_joined";


            userData.$connections$ = userData.$connections$ || {};

            if (type == "Page") {

                user_connection_persist_collection = "pages_user_follow";

                userData.$connections$.page_follow_count = userData.$connections$.page_follow_count || 0;
                userData.$connections$.page_follow_count++;


                userData.$extras$.pages_user_follow = userData.$extras$.pages_user_follow || { last_num: 0, last_node_dir: 1, last_node_dir_count: 1 };

                userData.$extras$.pages_user_follow.last_num++;

                if (userData.$extras$.pages_user_follow.last_num === options.connection_node_limit + 1) {

                    userData.$extras$.pages_user_follow.last_num = 0;
                    userData.$extras$.pages_user_follow.last_node_dir++;

                    userData.$extras$.pages_user_follow.last_node_dir_count++;

                }

            }

            else {

                userData.$connections$.group_joined_count = userData.$connections$.group_joined_count || 0;
                userData.$connections$.group_joined_count++;


                _Connections.groups_user_joined = _Connections.groups_user_joined || {};
                _Connections.groups_user_joined[actorId] = _Connections.groups_user_joined[actorId] || {};
                _Connections.groups_user_joined[actorId][options.subjectId] = '-';


                userData.$extras$.groups_user_joined = userData.$extras$.groups_user_joined || { last_num: 0, last_node_dir: 1, last_node_dir_count: 1 };
                userData.$extras$.groups_user_joined.last_num++;

                if (userData.$extras$.groups_user_joined.last_num === options.connection_node_limit + 1) {

                    userData.$extras$.groups_user_joined.last_num = 0;
                    userData.$extras$.groups_user_joined.last_node_dir++;

                    userData.$extras$.groups_user_joined.last_node_dir_count++;

                }

            }

            // @@ set indexes -- == --- //  00 //
            _Connections.entity_linkup = _Connections.entity_linkup || {};
            _Connections.entity_linkup[options.subjectId] = _Connections.entity_linkup[options.subjectId] || {};
            _Connections.entity_linkup[options.subjectId][actorId] = '-';


            _Cache['cpx_users'][actorId] = userData;
            _Cache['cpx_entity'][options.subjectId] = entityData;


            // @@ number of follows and likes
            admin_report.report.connections_count = admin_report.report.connections_count || 0;
            admin_report.report.connections_count++

            // @@ persist connection -- / -- / 
            // @@ persist connections for Entity...
            // let _date_ = new Date();
            // _date_ = _date_.toISOString();

            const persistWorker = new Worker("./db_worker.js", {
                smol: true,
            });

            persistWorker.postMessage({
                type,
                dir: options.dir,
                fnc: 'persist_entity_linkup',
                entity_id: options.subjectId,
                user_id: options.actorId,
                admin_report,
                entityData,
                userData,
                entity_id_track: entityData.$extras$.linkup_track,
                user_id_track: type == "Page" ? userData.$extras$.pages_user_follow : userData.$extras$.groups_user_joined

            });

            return { msg: 'OK' }


        }

        return { msg: 'Error' }

    } catch (error) {
        console.log(' error :: ---> ', error);

        return { msg: 'Error' }
    }

};



connection_functions.unlinkup_with_entity = async function (_Cache, _Connections, admin_report, options) {


    try {


        let entityData = _Cache['cpx_entity'][options.subjectId];

        let type = options.type;

        let actorId = options.actorId;

        let userData = _Cache['cpx_users'][actorId];

        // console.log(' linkup ran  :: ---> ', type, '\n kook --->', options  );
        // return {msg: 'Working' }

        if (entityData && entityData._id) {

            entityData.$connections$ = entityData.$connections$ || {};

            entityData.$connections$.linkups = entityData.$connections$.linkups || 0;

            entityData.$connections$.linkups--;



            // @@ --- persist straight up
            // let options = {
            //     collection: 'cpx_entity'
            // };

            // @@ update admin report as well...

            // let current_count = (parseInt(d.$connections$.linkups / 100) + 1) * 100;
            // let entity_file_name = current_count;

            let user_connection_persist_collection = "groups_user_joined";


            userData.$connections$ = userData.$connections$ || {};

            if (type == "Page") {

                user_connection_persist_collection = "pages_user_follow";

                userData.$connections$.page_follow_count = userData.$connections$.page_follow_count || 0;
                userData.$connections$.page_follow_count--;


            }

            else {

                userData.$connections$.group_joined_count = userData.$connections$.group_joined_count || 0;
                userData.$connections$.group_joined_count--;

                _Connections.groups_user_joined = _Connections.groups_user_joined || {};
                _Connections.groups_user_joined[actorId] = _Connections.groups_user_joined[actorId] || {};
                delete _Connections.groups_user_joined[actorId][options.subjectId];

                // user_count_file_name = (parseInt(userData.$connections$.group_joined_count / 100) + 1) * 100;

            }

            // @@ set indexes -- == --- //  00 //
            _Connections.entity_linkup = _Connections.entity_linkup || {};
            _Connections.entity_linkup[options.subjectId] = _Connections.entity_linkup[options.subjectId] || {};
            delete _Connections.entity_linkup[options.subjectId][actorId];

            _Cache['cpx_users'][actorId] = userData;
            _Cache['cpx_entity'][options.subjectId] = entityData;


            // @@ number of follows and likes
            admin_report.report.connections_count = admin_report.report.connections_count || 0;
            admin_report.report.connections_count--

            // @@ persist connection -- / -- / 
            // @@ persist connections for Entity...
            // let _date_ = new Date();
            // _date_ = _date_.toISOString();

            const persistWorker = new Worker("./db_worker.js", {
                smol: true,
            });

            persistWorker.postMessage({
                type,
                dir: options.dir,
                fnc: 'unpersist_entity_linkup',
                entity_id: options.subjectId,
                user_id: options.actorId,
                admin_report,
                entityData,
                userData,

            });

            return { msg: 'OK' }

        }

        return { msg: 'Error' }

    } catch (error) {
        console.log(' error :: ---> ', error);
        return { msg: 'Error' }
    }

};






connection_functions.like_post = async function (_Cache, _Connections, admin_report, options) {

    try {

        let post_to_like_doc = _Cache['cpx_posts'][options.subjectId];

        let actor_doc = _Cache['cpx_users'][options.actorId];

        if (!post_to_like_doc || !post_to_like_doc._id) { return { msg: '404' } }

        // console.log(' Liking post :: --> ', options);

        _Connections['post_likes'] = _Connections['post_likes'] || {};

        _Connections['post_likes'][options.subjectId] = _Connections['post_likes'][options.subjectId] || {};

        if (_Connections['post_likes'][options.subjectId][options.actorId]) {
            return { msg: '400' }
        }

        _Connections['post_likes'][options.subjectId][options.actorId] = '-';


        post_to_like_doc.$connections$ = post_to_like_doc.$connections$ || {};

        post_to_like_doc.$connections$.likes_count = post_to_like_doc.$connections$.likes_count || 0;
        post_to_like_doc.$connections$.likes_count++;


        post_to_like_doc.$extras$.likes_count = post_to_like_doc.$extras$.likes_count || { last_num: 0, last_node_dir: 1, last_node_dir_count: 1 };

        post_to_like_doc.$extras$.likes_count.last_num++;

        if (post_to_like_doc.$extras$.likes_count.last_num === options.connection_node_limit + 1) {

            post_to_like_doc.$extras$.likes_count.last_num = 0;
            post_to_like_doc.$extras$.likes_count.last_node_dir++;

            post_to_like_doc.$extras$.likes_count.last_node_dir_count++;

        }


        // @@ -- Actor Doc 

        actor_doc.$extras$.posts_users_reacted_to = actor_doc.$extras$.posts_users_reacted_to || { last_num: 0, last_node_dir: 1, last_node_dir_count: 1 };

        actor_doc.$extras$.posts_users_reacted_to.last_num++;

        if (actor_doc.$extras$.posts_users_reacted_to.last_num === options.connection_node_limit + 1) {

            actor_doc.$extras$.posts_users_reacted_to.last_num = 0;
            actor_doc.$extras$.posts_users_reacted_to.last_node_dir++;

            actor_doc.$extras$.posts_users_reacted_to.last_node_dir_count++;

        }



        // @@ persist Sqy Cache
        _Cache['cpx_posts'][options.subjectId] = post_to_like_doc;
        _Cache['cpx_users'][options.actorId] = actor_doc;
        // SqyDB.fncs.reCache_and_persist_updated_doc(updatedDoc, { collection: 'cpx_posts' })


        // @@ persist connection
        const persistWorker = new Worker("./db_worker.js", {
            smol: true,
        });

        persistWorker.postMessage({

            dir: options.dir,
            fnc: 'persist_post_like',
            post_id: options.subjectId,
            user_id: options.actorId,
            post_id_track: post_to_like_doc.$extras$.likes_count,
            user_id_track: actor_doc.$extras$.posts_users_reacted_to,
            postData: post_to_like_doc,
            userData: actor_doc

        });

        // console.log('post_likes :: ->', _Connections);

        return { msg: 'OK' }

    } catch (error) {

        console.log('Like Post Err ->', error);
        return { msg: 'Error' }
    }


}



connection_functions.unlike_post = function (_Cache, _Connections, admin_report, options) {

    try {

        let post_to_like_doc = _Cache['cpx_posts'][options.subjectId];

        if (!post_to_like_doc || !post_to_like_doc._id) { return { msg: '404' } }

        // console.log(' Liking post :: --> ', options);

        _Connections['post_likes'] = _Connections['post_likes'] || {};

        _Connections['post_likes'][options.subjectId] = _Connections['post_likes'][options.subjectId] || {};

        if (!_Connections['post_likes'][options.subjectId][options.actorId]) {
            return { msg: '400' }
        }

        delete _Connections['post_likes'][options.subjectId][options.actorId];


        post_to_like_doc.$connections$ = post_to_like_doc.$connections$ || {};

        post_to_like_doc.$connections$.likes_count = post_to_like_doc.$connections$.likes_count || 0;
        post_to_like_doc.$connections$.likes_count--;



        // @@ persist Sqy Cache
        _Cache['cpx_posts'][options.subjectId] = post_to_like_doc;
        // SqyDB.fncs.reCache_and_persist_updated_doc(updatedDoc, { collection: 'cpx_posts' })


        // @@ persist connection
        const persistWorker = new Worker("./db_worker.js", {
            smol: true,
        });

        persistWorker.postMessage({

            dir: options.dir,
            fnc: 'unpersist_post_like',
            post_id: options.subjectId,
            user_id: options.actorId,
            postData: post_to_like_doc,

        });

        console.log('unlike post :: ->', _Connections);

        return { msg: 'OK' }

    } catch (error) {

        console.log('Like Post Err ->', error);
        return { msg: 'Error' }
    }


}


