const allowed_roles = ['xSuperLSSBxAdmin'];

export let create_institution = async function (reqObj, model, helpers) {

    if (!helpers.auth$) {
        return { error: { msg: 'Authorization required. Kindly login!!' }, statusCode: 401, success: false };
    }

    if (!helpers.auth$.role || allowed_roles.indexOf(helpers.auth$.role) === -1) {
        return { error: { msg: 'Only Super Admin can create institutions' }, statusCode: 403, success: false };
    }

    if (!reqObj.payloadData._fields || !reqObj.payloadData._fields.name || !reqObj.payloadData._fields.name.trim()) {
        return { success: false, statusCode: 400, error: { msg: 'Institution name is required' } };
    }

    const inst_model = helpers.institutions_model;
    const name = reqObj.payloadData._fields.name.trim();
    const value = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

    const exists = await inst_model.check_exists({ $where: { '_fields.value': value } });
    if (exists && exists.msg) {
        return { success: false, statusCode: 400, error: { msg: 'Institution already exists' } };
    }

    const $uid$ = helpers.utils.generate_uid(value) + helpers.aNode;

    const db_response = await inst_model.set({
        data: {
            $uid$,
            $creator$: helpers.auth$._id || helpers.auth$.$uid$ || $uid$,
            '$extras$': { '$n': 'n' },
            role: 'institution',
            _fields: { name, value, status: 'active' }
        }
    });

    if (!db_response || db_response.msg !== 'OK') {
        return { success: false, statusCode: 500, error: { msg: 'Error creating institution' } };
    }

    return { success: true, statusCode: 200, data: { msg: 'Institution created successfully', _id: db_response._id, value, name } };
};
