export let fetch_institutions_public = async function (reqObj, model, helpers) {
    const inst_model = helpers.institutions_model;
    if (!inst_model) {
        return { success: true, statusCode: 200, data: { data: [] } };
    }
    const db_response = await inst_model.get({
        $where: { '_fields.status': 'active' },
        db_fn: 'listDocuments',
        $skip: 0,
        $limit: 500
    });
    const docs = (db_response && db_response.documents) ? db_response.documents : [];
    return { success: true, statusCode: 200, data: { data: docs } };
};
