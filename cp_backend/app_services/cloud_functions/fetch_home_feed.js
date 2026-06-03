// fetch_feed

// @@ fetch latest posts and filter out the once I've seen before for now

const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

export let fetch_home_feed = async function (reqObj, model, helpers) {


    // if (reqObj.payloadData.cloud_action == 'create_account') {}

    // console.log('bcp_feeds ---- hit ---0---- --==>', reqObj.payloadData);

    let feed_options = {
        $page: reqObj.payloadData.$page || 0,
        db_fn: 'get_feed',
        $where: { _id: reqObj.payloadData.user }
    }

    let db_get_response = await model.get(feed_options);

    // console.log('Get home Feeds db_response -===>', db_get_response);

    if (db_get_response && db_get_response.msg == 'NULL') {

        return { success: true, statusCode: 404, data: { msg: 'Resource not found' } }
    }

    if (db_get_response && db_get_response.feed) {


        db_get_response.feed.posts = shuffle(db_get_response.feed.posts);

        db_get_response.feed.user_suggestions = shuffle(db_get_response.feed.user_suggestions);

        db_get_response.feed.media_center = shuffle(db_get_response.feed.media_center);

        // https://stackoverflow.com/questions/9933662/split-array-into-two-arrays
        // var arr = ['a', 'b', 'c', 'd', 'e', 'f'];

        // var indexToSplit = arr.indexOf('c');
        // var first = arr.slice(0, indexToSplit);
        // var second = arr.slice(indexToSplit + 1);

        // console.log({ first, second });

        var indexToSplit = db_get_response.feed.posts.length / 2;
        var posts = db_get_response.feed.posts.slice(0, indexToSplit);
        var posts2 = db_get_response.feed.posts.slice(indexToSplit);



        // console.log('ARRAY -->', { l1: posts.length, l2: posts2.length, lm: db_get_response.feed.posts.length });

        db_get_response.feed.posts = null;
        indexToSplit = null;

        return { success: true, statusCode: 200, data: { media_center: db_get_response.feed.media_center, posts, user_suggestions: db_get_response.feed.user_suggestions, posts2, entity: db_get_response.feed.entity, store: db_get_response.feed.store } }
    }

    return { success: false, statusCode: 500, data: { msg: 'Error fetching feeds' } }
}