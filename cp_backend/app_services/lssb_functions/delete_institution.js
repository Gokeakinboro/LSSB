const allowed_roles = ['xSuperLSSBxAdmin'];

export let delete_institution = async function (reqObj, model, helpers) {

    if (!helpers.auth$) {
        return { error: { msg: 'Authorization required. Kindly login!!' }, statusCode: 401, success: false };
    }

    if (!helpers.auth$.role || allowed_roles.indexOf(helpers.auth$.role) === -1) {
        return { error: { msg: 'Only Super Admin can delete institutions' }, statusCode: 403, success: false };
    }

    if (!reqObj.payloadData._id) {
        return { success: false, statusCode: 400, error: { msg: 'Institution _id is required' } };
    }

    const inst_model = helpers.institutions_model;

    const db_response = await inst_model.update({
        $where: { _id: reqObj.payloadData._id },
        data: { '_fields.status': 'deleted' }
    });

    if (!db_response || db_response.msg !== 'OK') {
        return { success: false, statusCode: 500, error: { msg: 'Error deleting institution' } };
    }

    return { success: true, statusCode: 200, data: { msg: 'Institution deleted successfully' } };
};
