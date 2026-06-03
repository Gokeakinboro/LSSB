export const _check_exists = async function(options, SqyDB_Cache, SqyDB_index, SqyDB_stats) {

     /* 
     * @@ 1. Check whether a data with a key exists -- return true if so
     * @@ -- start by checking the index if index exists in collection before scan current cache
     * && -- break Cache fror-loop scan on first result
     * @@ -- scan across node and clusters
     *  @@ later chache index by alphabeticall shards --
     *  @@ so indexes searchs go to specifi shard etc
     *  @@ e.g a search for username vicman should go to vi shard.. etc
     **/

    // let dataPool = SqyDB_cache[options.config][options.collection]; 

    // * @@ 1. Get the _id 
    // let _id = options._id || ( options.$where && options.$where._id );


    // let $creator$ = options.$where ? options.$where.$creator$ || null : null;
    let where_key = Object.keys(options.$where)[0];
    let where_val = options.$where[where_key];

    // console.log(' w$$$$$$ --===>', options.$where, where_key, SqyDB_index[options.collection], where_val )

    if ( SqyDB_stats[options.collection].collection_index.indexOf(where_key) > -1) {

        // search acros nodes and clusters
        if ( where_key == '_id') {

           return { msg: SqyDB_index[options.collection]._id.hasOwnProperty(where_val), _id: SqyDB_index[options.collection]._id[where_val] }
        }

        return { msg: SqyDB_index[options.collection].others.hasOwnProperty(where_val), _id: SqyDB_index[options.collection].others[where_val] }

        // if ( SqyDB_index[options.collection].hasOwnProperty(where_val) ) {
        //     return { msg: true }
        // }
        // return { msg: false }

        // @@ search other Nodes & clusters if available 
        // return SqyDB_stats[options.collection].hasOwnProperty(where_key);
    }

    // @@ false or device a means to search across clusters
    return { msg: false }

    // 

    // console.log( ' SqY DB --====> GET --->', _id, $creator$, options, '\n\n --------->>>> Cache', SqyDB_Cache[options.collection],  '\n\n --------->>>> Stats', SqyDB_stats[options.collection] );

    // return {}

    
}