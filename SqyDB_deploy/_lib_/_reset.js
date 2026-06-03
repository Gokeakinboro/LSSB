
export const _reset = async function(options, SqyDB_Cache, SqyDB_index, SqyDB_stats) {

     // * @@ 1. Get the _id 
     let _id = options._id;


     if (typeof _id == 'string') {

        return await get_one_by_id(_id, options, SqyDB_Cache, SqyDB_index);
    }

     let $creator$ = options.$where && options.$where.$creator$;
 
     if ($creator$) {
 
         $creator$ = options.$where.$creator$;
         _id = SqyDB_index[options.collection].others[$creator$];
     }

}