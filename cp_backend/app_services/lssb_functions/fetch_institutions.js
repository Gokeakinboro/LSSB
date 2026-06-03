export let fetch_institutions = async function (reqObj, model, helpers) {

    if (!helpers.auth$) {
        return { error: { msg: 'Authorization required. Kindly login!!' }, statusCode: 401, success: false };
    }

    const inst_model = helpers.institutions_model;

    const db_response = await inst_model.get({
        $where: { '_fields.status': 'active' },
        db_fn: 'listDocuments',
        $skip: 0,
        $limit: 500
    });

    if (!db_response) {
        return { success: false, statusCode: 500, error: { msg: 'Error fetching institutions' } };
    }

    const docs = (db_response && db_response.documents) ? db_response.documents : [];
    return { success: true, statusCode: 200, data: { data: docs } };
};
