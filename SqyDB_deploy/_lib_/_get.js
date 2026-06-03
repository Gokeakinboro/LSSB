
const { filter_engine } = await import('./filter_engine.js');

const get_one_by_id = async function (_id, options, SqyDB_Cache, SqyDB_index, SqyDB_stats) {

    /* 
    * @@ 1. Get the doc with the supplied _id or all if no _id is supplied 
    **/
    // let dataPool = SqyDB_cache[options.config][options.collection]; 


    // console.log('12 _get Get By ID ------------------->>>', options.collection, '---', SqyDB_Cache[options.collection], '----', _id,  SqyDB_Cache[options.collection][_id] )

    // * @@ 1. Get by ID from Cache 
    let doc1 = SqyDB_Cache[options.collection][_id];
    if (doc1 && doc1._id) {
        return { msg: 'OK',  doc: doc1 }
    }

    // @@ else check across the cluster
    // -- smart checking via _id analyzing
    // -- return null for now
    return { msg: 'NULL'}



}


const get_docs_by_query = async function (options, SqyDB_Cache, SqyDB_index, SqyDB_stats) {

    /* 
    * @@ 1. Get the doc with the supplied _id or all if no _id is supplied 
    **/
    // let dataPool = SqyDB_cache[options.config][options.collection]; 

    // * @@ 1. Get by $query
    let documents = [];
    let startTime = Date.now(), found = false;

    let skip = options.$skip || 0;
    let limit = options.$limit || 10;
    // let end = parseInt(limit) + parseInt(skip);
    let end = 0;
    let i = 0;
    let res_;

    for (const id_key in SqyDB_index[options.collection]['_id']) {


        if (found && ( !options.$limit || options.$limit <= 1) ) { break; }

        res_ = filter_engine(SqyDB_Cache[options.collection][id_key], options);

        if (res_.status == 'true') {

            found = true;

            // break when we find on if the option was passed
            // if (options.get_just_one) {
            // console.log('1134 get just one got -- from many?', options.find_one_from_many );
            // }
            // break;
            // @@  -- joining from others coll
            if (typeof options['$join'] == 'object' && options['$join']) {

                let join_keys = Object.keys(options['$join']);

                // console.log(' $$join res --=======---====> 00', join_keys );


                if (join_keys.length == 2) {

                    let join_collection = options['$join'][join_keys[1]];

                    let join_value = options['$join'][join_keys[0]];

                    join_value = res_.data[join_value];


                    // pointer //
                    join_collection = SqyDB.route_collections_map[join_collection];


                    // console.log(' $$join res --=======---====> 00', SqyDB.route_collections_map, join_value, join_collection, SqyDB_cache[options.db][join_collection][join_value] );


                    if (typeof join_value !== 'undefined' && SqyDB_sort_cache[options.db][join_collection] && SqyDB_cache[options.db][join_collection][join_value]) {

                        let d_join = SqyDB_cache[options.db][join_collection][join_value];
                        Object.keys(d_join).forEach(jk => {

                            if (!res_.data.hasOwnProperty(jk)) {
                                res_.data[jk] = d_join[jk];
                            }

                        });
                        // res_.data;

                        // console.log(' $$join res --=======---====> @AAAA --- ____ +==++ - ', res_.data );

                    }
                }


            }

            i++;
            // console.log( 'end -->', end );

            if (i >= skip && end < limit) {

                // creators.push(res_.data.__creator_);

                documents.push(res_.data);
                end++;

            }

        }


    }

    //    console.log( ' SqY DB --====> GET by $query --->', options, '\n\n --------->>>> Cache', 'SqyDB_Cache[options.collection]', '\n\n --------->>>> Index', SqyDB_index, '\n\n --------->>>> Stats', SqyDB_stats[options.collection] );

    console.log(  ' GET by $query documents ---> ', 
                  'documents', '\n', 'options.$query', options, '\n ----- in ', 'SqyDB_Cache[options.collection]', (Date.now() - startTime ) / 1000  );
    // __creator_: creator_final, creators
    return { documents, count: i, limit, skipped: skip }
    // @@ else check across the cluster


};

export const _get = async function (options, SqyDB_Cache, SqyDB_index, SqyDB_stats) {

    /* 
    * @@ 1. Get the doc with the supplied _id or all if no _id is supplied 
    **/
    // let dataPool = SqyDB_cache[options.config][options.collection]; 

    // console.log('getet 90 ===::m===:: -----<<>>>>>', options, SqyDB_index['cpFeeds'], !options.$where && !options.$where_not && !options.$search  );

    if ( !options.$where && !options.$where_not && !options.$search ) {

        return { msg: 'Bad Options' }
    }

    // console.log('get ing cpFeedo ===::m===:: -----<<>>>>>', options, SqyDB_index['cpFeeds'], !options.$where && !options.$where_not && !options.$search  );

    // * @@ 1. Get the _id 
    let _id = options._id || (options.$where && options.$where._id);

    // console.log('get ing cpFeedo ===::m===:: -----<<>>>>>', options, '_id _id ---:: -->', _id );

    if (typeof _id == 'string') {

        return await get_one_by_id(_id, options, SqyDB_Cache, SqyDB_index);
    }

    // @@ proceed to $query filters 

    return await get_docs_by_query(options, SqyDB_Cache, SqyDB_index, SqyDB_stats);

    // let $creator$ = options.$where ? options.$where.$creator$ || null : null;

    // if ($creator$) {

    //     $creator$ = options.$where.$creator$;
    //     _id = SqyDB_index[options.collection][$creator$];
    // }

    // console.log( ' SqY DB --====> GET --->', _id, $creator$, options, '\n\n --------->>>> Cache', 'SqyDB_Cache[options.collection]', '\n\n --------->>>> Index', SqyDB_index, '\n\n --------->>>> Stats', SqyDB_stats[options.collection] );

    // return {}

    // @@ add creator to projections  --- hack
    // if (options.$projection && typeof options.$projection.length == 'number') {
    //     options.$projection.push('$creator$');
    // }

    // // @@ get by _id
    // if (_id) {

    //     options.find_one_from_many = true;

    //     let res_ = filter_engine(SqyDB_cache[options.db][options.collection][_id], options, true);

    //     return res_;

    // }


    // // return { doc: SqyDB_Cache[options.collection][_id], msg: 'OK' }

    // if (SqyDB_Cache[options.collection] && SqyDB_Cache[options.collection][_id] ) {

    //     return { doc: SqyDB_Cache[options.collection][_id], msg: 'OK' }
    // }


    // return { msg: 'NULL' }
}