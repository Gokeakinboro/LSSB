export let fetch_notifications = async function (reqObj, model, helpers) {

    if (!helpers.auth$) {
        return { error: { msg: 'Authorization required. Kindly login!!' }, statusCode: 401, success: false };
    }

    const user_id = helpers.auth$._id;

    if (!user_id) {
        return { error: { msg: 'User ID not found in token' }, statusCode: 401, success: false };
    }

    let db_res = await model.get({
        db_fn: 'fetch_user_notifications',
        user_id,
    });

    if (db_res && db_res.notifications) {
        const unread_count = db_res.notifications.filter(n => !n.is_read).length;
        return {
            success: true,
            statusCode: 200,
            data: {
                notifications: db_res.notifications,
                unread_count,
            }
        };
    }

    return { success: true, statusCode: 200, data: { notifications: [], unread_count: 0 } };
};

export let mark_notifications_read = async function (reqObj, model, helpers) {

    if (!helpers.auth$) {
        return { error: { msg: 'Authorization required' }, statusCode: 401, success: false };
    }

    const user_id = helpers.auth$._id;

    await model.get({
        db_fn: 'mark_notifications_read',
        user_id,
    });

    return { success: true, statusCode: 200, data: { msg: 'Notifications marked as read' } };
};
