
const { date_ranger } = await import('../_lib_/date_ranger.js');

const allowed_roles = ['xSuperLSSBxAdmin', 'xLSSBxAdmin', '$Sys9'];

// const { mm } = await import('../Worker/LSSB_BG_Worker.js');
// const worker = new Worker("./Worker/LSSB_BG_Worker.js");


// worker.addEventListener("close", event => {
//     worker.terminate();
//     console.log("worker 00 is being closed");
// });

export let fetch_applications = async function (reqObj, model, helpers) {


    // let byWho = reqObj.payloadData.owner == 'entity' ? '' : '';



    if (!helpers.auth$) {
        return { error: { msg: 'Authorization required. Kindly login!!' }, statusCode: 401, success: false };
    }

    if (typeof reqObj.auth_expires == 'number'
        && typeof helpers.auth$ == 'object' && helpers.auth$ !== null
        && typeof helpers.auth$.timeSinceIssued == 'number' &&
        auth$.timeSinceIssued > reqObj.auth_expires

    ) {

        return { error: { msg: 'Expired Authorization. Kindly login again!!' }, statusCode: 401, success: false };
    }

    if (reqObj.payloadData.$where && reqObj.payloadData.$where['_fields.applicant_id'] == '$self') {


        // @@ -- Only Admins allowed
        if (!helpers.auth$._id) {

            // if (!reqObj.payloadData.$where && !reqObj.payloadData.$where.applicant_id) {
            return { error: { msg: 'Unauthorized Application request' }, statusCode: 401, success: false };
            // }

        }

        reqObj.payloadData.$page = reqObj.payloadData.$page || 1;
        let $limit = reqObj.payloadData.$items_per_page || 4;


        let db_get_response = await model.get({

            $where: { '_fields.applicant_id': helpers.auth$._id },
            // $where: reqObj.payloadData.$where,
            db_fn: 'listDocuments',
            collection: 'LSSB_applications',
            $join: reqObj.payloadData.$join || {},
            $skip: reqObj.payloadData.$page == 1 ? 0 : ((reqObj.payloadData.$page - 1) * $limit),
            $limit
        });



        // console.log(' 00 - fetching Applications :: -->', helpers.auth$._id, reqObj.payloadData.$join);

        // console.log(

        //     'Get 1 Application db_response -===>', 'db_get_response',
        //     reqObj.payloadData, '\n $check res --->>',
        //     //  db_get_response.check_connection_resul
        //     db_get_response

        // );



        // const obj = { a: 1, b: 2, c: 3, d: 4 }
        // const clone = (({ b, c, ...o }) => o)(obj) // remove b and c
        // console.log(clone);
        // @@ for where clauses with multiple returns
        if (db_get_response && db_get_response.documents) {



            // @@ reprepare data....
            let responseData = [];

            db_get_response.documents.forEach(doc => {

                doc.$join = doc.$join || { _fields: {} };
                doc._academic_criteria = doc._academic_criteria || {};

                let docUse = {

                    // "Fullname": doc._fields.applicant_fullname || doc.$join._fields.fullname || "null", // "Kelvin Bassey",
                    "Fullname": `${doc?.$join?._fields.lastname} ${doc?.$join?._fields.firstname} ${doc?.$join?._fields.middleName}`,

                    // "Sex": doc.$join._fields.sex || "null", //: "male",
                    "Gender": doc.$join._fields.sex || "null", //: "male",

                    "Image": doc.$join._fields.image || "null",

                    "Institution": doc._fields.school || "null", // "Unilag",

                    "Id_Image": doc.$join._fields.id_image || "null",

                    // "Bank_Name": doc.$join._fields.bank_name || "null",
                    // "Account_Number": doc.$join._fields.account_number || "null",
                    // "Account_Name": doc.$join._fields.account_name || "null",


                    "Es_approval": doc._fields.Es_approval || "null",
                    "Pass_approval": doc._fields.Pass_approval || "null",
                    "Audit_approval": doc._fields.Audit_approval || "null",
                    "Finance_approval": doc._fields.Finance_approval || "null",
                    "Cbt_verification": doc._fields.Cbt_verification || "null",

                    "Pass_comment": doc._fields.Pass_comment || "null",
                    "Pass_approver_name": doc._fields.Pass_approver_name || "null",

                    "Audit_comment": doc._fields.Audit_comment || "null",
                    "Audit_approver_name": doc._fields.Audit_approver_name || "null",

                    "Finance_comment": doc._fields.Finance_comment || "null",
                    "Finance_approver_name": doc._fields.Finance_approver_name || "null",

                    "Es_comment": doc._fields.Es_comment || "null",

                    "Studentship_verification": doc._academic_criteria.Studentship_verification || "null",
                    "Indegeneship_verification": doc._academic_criteria.Indegeneship_verification || "null",

                    "Indigeneship_Status": doc._academic_criteria.indigeneship_status || "null", // "undergraduate",
                    "Studentship_Status": doc._academic_criteria.studentship_status || "null", // "BDG",
                    "Cgpa_value": doc._academic_criteria.cgpa_value || "null",

                    "Amount_due": doc._academic_criteria.amount_due || 0,

                    "Cbt_Score": doc._academic_criteria.cbt_score || "null", // "BDG",
                    "cgpa": doc._academic_criteria.cgpa || "null", // "undergraduate",

                    "Edu_Level": doc._fields.edu_level || "null", // "undergraduate",
                    "Division": doc._fields.applicant_division || "null", // "BDG",

                    "Grant": doc._fields.grant_name || "null", // "Lagos State Bursary",
                    "Grant_Type": doc._fields.grant_type || "null",
                    "Applied_As": doc._fields.initially_submitted_as || "null",


                    "Email": doc.$join._fields.email || "null", //: "tochi345@lssb.net",
                    // username: "tochi345",
                    // password: "#ENCRYPTED#",

                    "Phone_No": doc.$join._fields.phone_no || "null", //: "08021132789",
                    "NIN": doc.$join._fields.nin || "null", //: "8944ygjklgh",
                    "Date_of_Birth": doc.$join._fields.dob || "null", //: "12-june-1780",


                    // application_year: "2024-2025",
                    // doc.application_year_code: "2425",


                    "Academic_Result": doc._fields.academic_result || "null",// "4.0",
                    "Application_Status": doc._fields.application_status || "null",// : "pending",
                    "Matric_No": doc._fields.matric_no || "null",// "388HJ79707",
                    "Current_Level": doc._fields.current_level || "null",  //"300L",
                    "Course": doc._fields.course || "null", // "Medicine & Surgery",
                    "Study_Duration": doc._fields.study_duration || "null",// "NILL",
                    "Year_of_Admission": doc._fields.year_of_admission || "null", // "2020",
                    "Year_of_Completion": doc._fields.year_of_completion || "null", // "2024",

                    "Bank_name": doc._fields.Bank_name || "null", // "2024",
                    "Bank_account": doc._fields.Bank_account || "null", // "2024",
                    "Bank_Account_name": doc._fields.Account_name || "null", // "2024",

                    "Refree": doc._fields.refree || "null", // "Mrs. Jane Doe",
                    "Refree_Phone": doc._fields.refree_phone || "null", // "07578980907",
                    "Refree_Address": doc._fields.refree_address || "null", // "180, Logan street, Lagos",
                    "Application_Num": doc._fields.application_num || "null", // "LSSBBUR12425T1A17894",
                    "Date_Applied": doc.$created_on$ || "null", // "LSSBBUR12425T1A17894",


                    "_id": doc._id

                };

                responseData.push(docUse);


            });


            return { success: true, statusCode: 200, data: { data: responseData } }
        }

        if ((db_get_response && db_get_response.msg == 'NULL')) {

            return { success: false, statusCode: 404, error: { msg: 'Null' } }
        }


        if (db_get_response && db_get_response.doc) {


            // delete db_get_response.doc.$creator$;
            // delete db_get_response.doc.$last_edited_on$;
            // delete db_get_response.doc.$t$;

            let doc = db_get_response.doc;
            doc.$join = doc.$join || { _fields: {} };
            doc._academic_criteria = doc._academic_criteria || {};


            let docUse = {

                // "Fullname": doc._fields.applicant_fullname || doc.$join._fields.fullname || "null",// "Kelvin Bassey",
                // "Fullname": `${doc?.$join?._fields.lastname} ${doc?.$join?._fields.firstname} ${doc?.$join?._fields.middleName}`,

                // // "Sex": doc.$join._fields.sex || "null", //: "male",
                // "Gender": doc.$join._fields.sex || "null", //: "male",

                // "Image": doc.$join._fields.image || "null",

                // "Institution": doc._fields.school || "null", // "Unilag",

                // "Id_Image": doc.$join._fields.id_image || "null",

                // "Bank_Name": doc.$join._fields.bank_name || "null",
                // "Account_Number": doc.$join._fields.account_number || "null",
                // "Account_Name": doc.$join._fields.account_name || "null",

                // "Es_approval": doc._fields.Es_approval || "null",
                // "Pass_approval": doc._fields.Pass_approval || "null",
                // "Audit_approval": doc._fields.Audit_approval || "null",
                // "Finance_approval": doc._fields.Finance_approval || "null",
                // "Cbt_verification": doc._fields.Cbt_verification || "null",

                // "Pass_comment": doc._fields.Pass_comment || "null",
                // "Pass_approver_name": doc._fields.Pass_approver_name || "null",

                // "Audit_comment": doc._fields.Audit_comment || "null",
                // "Audit_approver_name": doc._fields.Audit_approver_name || "null",

                // "Finance_comment": doc._fields.Finance_comment || "null",
                // "Finance_approver_name": doc._fields.Finance_approver_name || "null",

                // "Es_comment": doc._fields.Es_comment || "null",

                // "Studentship_verification": doc._academic_criteria.Studentship_verification || "null",
                // "Indegeneship_verification": doc._academic_criteria.Indegeneship_verification || "null",

                // "Indigeneship_Status": doc._academic_criteria.indigeneship_status || "null", // "undergraduate",
                // "Studentship_Status": doc._academic_criteria.studentship_status || "null", // "BDG",
                // "Cgpa_value": doc._academic_criteria.Cgpa_value || "null",

                // "Amount_due": doc._academic_criteria.amount_due || 0,


                // "Cbt_Score": doc._academic_criteria.cbt_score || "null", // "BDG",
                // "cgpa": doc._academic_criteria.cgpa || "null", // "undergraduate",

                // "Edu_Level": doc._fields.edu_level || "null", // "undergraduate",
                // "Division": doc._fields.applicant_division || "null", // "BDG",

                // "Grant": doc._fields.grant_name || "null", // "Lagos State Bursary",
                // "Grant_Type": doc._fields.grant_type || "null",
                // "Applied_As": doc._fields.initially_submitted_as || "null",


                // "Email": doc.$join._fields.email || "null", //: "tochi345@lssb.net",
                // // username: "tochi345",
                // // password: "#ENCRYPTED#",

                // "Phone_No": doc.$join._fields.phone_no || "null", //: "08021132789",
                // "NIN": doc.$join._fields.nin || "null", //: "8944ygjklgh",
                // "Date_of_Birth": doc.$join._fields.dob || "null", //: "12-june-1780",


                // // application_year: "2024-2025",
                // // doc.application_year_code: "2425",


                // "Academic_Result": doc._fields.academic_result || "null",// "4.0",
                // "Application_Status": doc._fields.application_status || "null",// : "pending",
                // "Matric_No": doc._fields.matric_no || "null",// "388HJ79707",
                // "Current_Level": doc._fields.current_level || "null",  //"300L",
                // "Course": doc._fields.course || "null", // "Medicine & Surgery",
                // "Study_Duration": doc._fields.study_duration || "null",// "NILL",
                // "Year_of_Admission": doc._fields.year_of_admission || "null", // "2020",
                // "Year_of_Completion": doc._fields.year_of_completion || "null", // "2024",

                // "Bank_name": doc._fields.Bank_name || "null", // "2024",
                // "Bank_account": doc._fields.Bank_account || "null", // "2024",
                // "Account_name": doc._fields.Account_name || "null", // "2024",

                // "Refree": doc._fields.refree || "null", // "Mrs. Jane Doe",
                // "Refree_Phone": doc._fields.refree_phone || "null", // "07578980907",
                // "Refree_Address": doc._fields.refree_address || "null", // "180, Logan street, Lagos",
                // "Application_Num": doc._fields.application_num || "null", // "LSSBBUR12425T1A17894",
                // "Date_Applied": doc.$created_on$ || "null", // "LSSBBUR12425T1A17894",
                // "_id": doc._id

                // "Fullname": doc._fields.applicant_fullname || doc.$join._fields.fullname || "null", // "Kelvin Bassey",
                "Fullname": `${doc?.$join?._fields.lastname} ${doc?.$join?._fields.firstname} ${doc?.$join?._fields.middleName}`,

                // "Sex": doc.$join._fields.sex || "null", //: "male",
                "Gender": doc.$join._fields.sex || "null", //: "male",

                "Image": doc.$join._fields.image || "null",

                "Institution": doc._fields.school || "null", // "Unilag",

                "Id_Image": doc.$join._fields.id_image || "null",

                // "Bank_Name": doc.$join._fields.bank_name || "null",
                // "Account_Number": doc.$join._fields.account_number || "null",
                // "Account_Name": doc.$join._fields.account_name || "null",


                "Es_approval": doc._fields.Es_approval || "null",
                "Pass_approval": doc._fields.Pass_approval || "null",
                "Audit_approval": doc._fields.Audit_approval || "null",
                "Finance_approval": doc._fields.Finance_approval || "null",
                "Cbt_verification": doc._fields.Cbt_verification || "null",

                "Pass_comment": doc._fields.Pass_comment || "null",
                "Pass_approver_name": doc._fields.Pass_approver_name || "null",

                "Audit_comment": doc._fields.Audit_comment || "null",
                "Audit_approver_name": doc._fields.Audit_approver_name || "null",

                "Finance_comment": doc._fields.Finance_comment || "null",
                "Finance_approver_name": doc._fields.Finance_approver_name || "null",

                "Es_comment": doc._fields.Es_comment || "null",

                "Studentship_verification": doc._academic_criteria.Studentship_verification || "null",
                "Indegeneship_verification": doc._academic_criteria.Indegeneship_verification || "null",

                "Indigeneship_Status": doc._academic_criteria.indigeneship_status || "null", // "undergraduate",
                "Studentship_Status": doc._academic_criteria.studentship_status || "null", // "BDG",
                // "Cgpa_value": doc._academic_criteria.Cgpa_value || "null",
                "Cgpa_value": doc._academic_criteria.cgpa_value || "null",

                "Amount_due": doc._academic_criteria.amount_due || 0,

                "Cbt_Score": doc._academic_criteria.cbt_score || "null", // "BDG",
                "cgpa": doc._academic_criteria.cgpa || "null", // "undergraduate",

                "Edu_Level": doc._fields.edu_level || "null", // "undergraduate",
                "Division": doc._fields.applicant_division || "null", // "BDG",

                "Grant": doc._fields.grant_name || "null", // "Lagos State Bursary",
                "Grant_Type": doc._fields.grant_type || "null",
                "Applied_As": doc._fields.initially_submitted_as || "null",


                "Email": doc.$join._fields.email || "null", //: "tochi345@lssb.net",
                // username: "tochi345",
                // password: "#ENCRYPTED#",

                "Phone_No": doc.$join._fields.phone_no || "null", //: "08021132789",
                "NIN": doc.$join._fields.nin || "null", //: "8944ygjklgh",
                "Date_of_Birth": doc.$join._fields.dob || "null", //: "12-june-1780",


                // application_year: "2024-2025",
                // doc.application_year_code: "2425",


                "Academic_Result": doc._fields.academic_result || "null",// "4.0",
                "Application_Status": doc._fields.application_status || "null",// : "pending",
                "Matric_No": doc._fields.matric_no || "null",// "388HJ79707",
                "Current_Level": doc._fields.current_level || "null",  //"300L",
                "Course": doc._fields.course || "null", // "Medicine & Surgery",
                "Study_Duration": doc._fields.study_duration || "null",// "NILL",
                "Year_of_Admission": doc._fields.year_of_admission || "null", // "2020",
                "Year_of_Completion": doc._fields.year_of_completion || "null", // "2024",

                "Bank_name": doc._fields.Bank_name || "null", // "2024",
                "Bank_account": doc._fields.Bank_account || "null", // "2024",
                "Bank_Account_name": doc._fields.Account_name || "null", // "2024",

                "Refree": doc._fields.refree || "null", // "Mrs. Jane Doe",
                "Refree_Phone": doc._fields.refree_phone || "null", // "07578980907",
                "Refree_Address": doc._fields.refree_address || "null", // "180, Logan street, Lagos",
                "Application_Num": doc._fields.application_num || "null", // "LSSBBUR12425T1A17894",
                "Date_Applied": doc.$created_on$ || "null", // "LSSBBUR12425T1A17894",


                "_id": doc._id

            };

            // db_get_response.documents
            return { success: true, statusCode: 200, data: { data: db_get_response.doc } }

        }

        return { success: false, statusCode: 500, error: { msg: 'Error Fetching' } }

    }




    // @@ -- Only Admins allowed
    if (!helpers.auth$.role || allowed_roles.indexOf(helpers.auth$.role) == -1) {

        if (!reqObj.payloadData.$where && !reqObj.payloadData.$where.applicant_id) {
            return { error: { msg: 'Not allowed. Only admins permitted' }, statusCode: 401, success: false };
        }

    }


    // if (reqObj.payloadData.$where && reqObj.payloadData.$where.applicant_id || reqObj.payloadData.$where && reqObj.payloadData.$where.applicant_id ) {
    // @@ single Fetch by _id
    if (reqObj.payloadData.$where && reqObj.payloadData.$where._id) {


        let db_get_response = await model.get({

            // $where: { _id: reqObj.payloadData.$where._id }, 
            $where: reqObj.payloadData.$where,
            $join: reqObj.payloadData.$join || {},
            $limit: 1
        });



        // console.log(' 00 - fetching Applications :: -->', reqObj.payloadData.$join);

        // console.log(

        //     'Get 1 Application db_response -===>', 'db_get_response',
        //     reqObj.payloadData, '\n $check res --->>',
        //     //  db_get_response.check_connection_resul
        //     db_get_response

        // );

        // const obj = { a: 1, b: 2, c: 3, d: 4 }
        // const clone = (({ b, c, ...o }) => o)(obj) // remove b and c
        // console.log(clone)
        // @@ for where clauses with multiple returns
        if ((db_get_response && db_get_response.documents)) {


            return { success: true, statusCode: 200, data: { data: db_get_response.documents } }
        }

        if ((db_get_response && db_get_response.msg == 'NULL')) {

            return { success: false, statusCode: 404, error: { msg: 'Null' } }
        }

        if ((db_get_response && db_get_response.msg == 'NULL')) {

            return { success: false, statusCode: 404, error: { msg: 'Null' } }
        }

        if (db_get_response && db_get_response.doc) {


            // delete db_get_response.doc.$creator$;
            // delete db_get_response.doc.$last_edited_on$;
            // delete db_get_response.doc.$t$;

            let doc = db_get_response.doc;
            doc.$join = doc.$join || { _fields: {} };
            doc._academic_criteria = doc._academic_criteria || {};


            let docUse = {

                // "Fullname": doc._fields.applicant_fullname || doc.$join._fields.fullname || "null", // "Kelvin Bassey",
                "Fullname": `${doc?.$join?._fields.lastname} ${doc?.$join?._fields.firstname} ${doc?.$join?._fields.middleName}`,

                // "Sex": doc.$join._fields.sex || "null", //: "male",
                "Gender": doc.$join._fields.sex || "null", //: "male",

                "Image": doc.$join._fields.image || "null",

                "Institution": doc._fields.school || "null", // "Unilag",

                "Id_Image": doc.$join._fields.id_image || "null",

                // "Bank_Name": doc.$join._fields.bank_name || "null",
                // "Account_Number": doc.$join._fields.account_number || "null",
                // "Account_Name": doc.$join._fields.account_name || "null",


                "Es_approval": doc._fields.Es_approval || "null",
                "Pass_approval": doc._fields.Pass_approval || "null",
                "Audit_approval": doc._fields.Audit_approval || "null",
                "Finance_approval": doc._fields.Finance_approval || "null",
                "Cbt_verification": doc._fields.Cbt_verification || "null",

                "Pass_comment": doc._fields.Pass_comment || "null",
                "Pass_approver_name": doc._fields.Pass_approver_name || "null",

                "Audit_comment": doc._fields.Audit_comment || "null",
                "Audit_approver_name": doc._fields.Audit_approver_name || "null",

                "Finance_comment": doc._fields.Finance_comment || "null",
                "Finance_approver_name": doc._fields.Finance_approver_name || "null",

                "Es_comment": doc._fields.Es_comment || "null",

                "Studentship_verification": doc._academic_criteria.Studentship_verification || "null",
                "Indegeneship_verification": doc._academic_criteria.Indegeneship_verification || "null",

                "Indigeneship_Status": doc._academic_criteria.indigeneship_status || "null", // "undergraduate",
                "Studentship_Status": doc._academic_criteria.studentship_status || "null", // "BDG",
                "Cgpa_value": doc._academic_criteria.cgpa_value || "null",

                "Amount_due": doc._academic_criteria.amount_due || 0,



                "Cbt_Score": doc._academic_criteria.cbt_score || "null", // "BDG",
                "cgpa": doc._academic_criteria.cgpa || "null", // "undergraduate",

                "Edu_Level": doc._fields.edu_level || "null", // "undergraduate",
                "Division": doc._fields.applicant_division || "null", // "BDG",

                "Grant": doc._fields.grant_name || "null", // "Lagos State Bursary",
                "Grant_Type": doc._fields.grant_type || "null",
                "Applied_As": doc._fields.initially_submitted_as || "null",


                "Email": doc.$join._fields.email || "null", //: "tochi345@lssb.net",
                // username: "tochi345",
                // password: "#ENCRYPTED#",

                "Phone_No": doc.$join._fields.phone_no || "null", //: "08021132789",
                "NIN": doc.$join._fields.nin || "null", //: "8944ygjklgh",
                "Date_of_Birth": doc.$join._fields.dob || "null", //: "12-june-1780",


                // application_year: "2024-2025",
                // doc.application_year_code: "2425",


                "Academic_Result": doc._fields.academic_result || "null",// "4.0",
                "Application_Status": doc._fields.application_status || "null",// : "pending",
                "Matric_No": doc._fields.matric_no || "null",// "388HJ79707",
                "Current_Level": doc._fields.current_level || "null",  //"300L",
                "Course": doc._fields.course || "null", // "Medicine & Surgery",
                "Study_Duration": doc._fields.study_duration || "null",// "NILL",
                "Year_of_Admission": doc._fields.year_of_admission || "null", // "2020",
                "Year_of_Completion": doc._fields.year_of_completion || "null", // "2024",

                "Bank_name": doc._fields.Bank_name || "null", // "2024",
                "Bank_account": doc._fields.Bank_account || "null", // "2024",
                "Bank_Account_name": doc._fields.Account_name || "null", // "2024",

                "Refree": doc._fields.refree || "null", // "Mrs. Jane Doe",
                "Refree_Phone": doc._fields.refree_phone || "null", // "07578980907",
                "Refree_Address": doc._fields.refree_address || "null", // "180, Logan street, Lagos",
                "Application_Num": doc._fields.application_num || "null", // "LSSBBUR12425T1A17894",
                "Date_Applied": doc.$created_on$ || "null", // "LSSBBUR12425T1A17894",


                "_id": doc._id

            };

            // db_get_response.documents
            return { success: true, statusCode: 200, data: { data: docUse } }

        }

        return { success: false, statusCode: 500, error: { msg: 'Error Fetching' } }

    }



    // @@ process where clauses
    let _p_where = reqObj.payloadData.$where || {};
    let $where = {};

    Object.keys(_p_where).forEach(where_clause => {

        if (where_clause !== '_id' && _p_where[where_clause] !== '') {
            $where[where_clause] = _p_where[where_clause];
        }

    });

    _p_where = null;

    // console.log(' >>>>>>>>> 501 fetch_aaplication >>>>> reqObj.payloadData.$page, --->',  reqObj.payloadData, $where );

    let $startDate = reqObj.payloadData.$startDate;

    reqObj.payloadData.$page = reqObj.payloadData.$page || 1;
    let $limit = reqObj.payloadData.$items_per_page || 10;

    let $where_not = reqObj.payloadData.$where_not || {};
    let $search = reqObj.payloadData.$search || {};
    let $date_range = [];

    if (reqObj.payloadData.$where && reqObj.payloadData.$where._id) {

        reqObj.payloadData.$page = 1;
        $limit = 1;
    }

    if (typeof $date_range !== 'object' || typeof $date_range.length !== 'number') {

        return { success: false, statusCode: 400, error: { msg: 'Date range must be Array' } }
    }

    let $date_ranger = { allow: false };
    if ($startDate) {

        $date_range.push($startDate);
        reqObj.payloadData.$endDate && $date_range.push(reqObj.payloadData.$endDate);

        let dr = date_ranger($date_range);

        if (dr.error) {

            return { success: false, statusCode: 400, error: { msg: dr.error } }
        }

        $date_ranger.range = dr.date_str;
        $date_ranger.allow = true;

    }

    // console.log(' reqObj.payloadData.$page, --->',  reqObj.payloadData.$page );



    let db_get_response = await model.get({

        // $where: { 'postAuthor.authorId': reqObj.payloadData.byWho }, 
        // $where: { 'author': reqObj.payloadData.byWho }, 
        // author_type: reqObj.payloadData.author_type || 'profile',
        $where,
        $search,
        $where_not,
        // $date_range,
        $join: reqObj.payloadData.$join || {},
        $date_ranger,
        db_fn: 'listDocuments',
        collection: 'LSSB_applications',
        $skip: reqObj.payloadData.$page == 1 ? 0 : ((reqObj.payloadData.$page - 1) * $limit),
        $limit,
        // $order: 're'
        // $check_connection: { $followings: reqObj.payloadData.user_id, $followers: reqObj.payloadData.user_id } 
    });


    // console.log(' >>>>>>>>> 565 fetch_aaplication >>>>> reqObj.payloadData.$page, ---> $where',  $where,
    //     $search,
    //     $where_not );

    // console.log(

    //     'Get Applications  --many -- db_response -===>', 'db_get_response',
    //     reqObj.payloadData, '\n \n -------------------000000----------->> $check res --->>',
    //     // db_get_response

    // );

    // const obj = { a: 1, b: 2, c: 3, d: 4 }
    // const clone = (({ b, c, ...o }) => o)(obj) // remove b and c
    // console.log(clone)

    // reqObj.worker.postMessage({
    //     fnc: 'send_mail',
    //     data: {
    //         sender: 'Vicman',
    //         from: 'LSSB'
    //     }
    // });



    if ((db_get_response && db_get_response.msg == 'NULL')) {

        return { success: true, statusCode: 404, data: { msg: 'Null' } }
    }

    if (db_get_response && db_get_response.documents) {


        // https://stackoverflow.com/questions/34698905/how-can-i-clone-a-javascript-object-except-for-one-key
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment

        // const docWithProjections = (({ user_id, $extras$, $creator$, $created_on$, $last_edited_on$, $last_edited_on, $t$, _email, ...o }) => o)(db_get_response.doc) // remove b and c

        // further 
        // delete docWithProjections._fields.phone_no;

        // @@ add connections 
        // docWithProjections.isFollowing = db_get_response.check_connection_result.$followings;
        // docWithProjections.isFollower = db_get_response.check_connection_result.$followers;

        // db_get_response.documents

        // if ((db_get_response && db_get_response.documents)) {


        // @@ reprepare data....
        let responseData = [];

        db_get_response.documents.forEach(doc => {

            doc.$join = doc.$join || { _fields: {} };
            doc._academic_criteria = doc._academic_criteria || {};

            let docUse = {

                // "Fullname": doc._fields.applicant_fullname || doc.$join._fields.fullname || "null", // "Kelvin Bassey",
                "Fullname": `${doc?.$join?._fields.lastname} ${doc?.$join?._fields.firstname} ${doc?.$join?._fields.middleName}`,

                // "Sex": doc.$join._fields.sex || "null", //: "male",
                "Gender": doc.$join._fields.sex || "null", //: "male",

                "Image": doc.$join._fields.image || "null",

                "Institution": doc._fields.school || "null", // "Unilag",

                "Id_Image": doc.$join._fields.id_image || "null",

                // "Bank_Name": doc.$join._fields.bank_name || "null",
                // "Account_Number": doc.$join._fields.account_number || "null",
                // "Account_Name": doc.$join._fields.account_name || "null",


                "Es_approval": doc._fields.Es_approval || "null",
                "Pass_approval": doc._fields.Pass_approval || "null",
                "Audit_approval": doc._fields.Audit_approval || "null",
                "Finance_approval": doc._fields.Finance_approval || "null",
                "Cbt_verification": doc._fields.Cbt_verification || "null",

                "Pass_comment": doc._fields.Pass_comment || "null",
                "Pass_approver_name": doc._fields.Pass_approver_name || "null",

                "Audit_comment": doc._fields.Audit_comment || "null",
                "Audit_approver_name": doc._fields.Audit_approver_name || "null",

                "Finance_comment": doc._fields.Finance_comment || "null",
                "Finance_approver_name": doc._fields.Finance_approver_name || "null",

                "Es_comment": doc._fields.Es_comment || "null",

                "Studentship_verification": doc._academic_criteria.Studentship_verification || "null",
                "Indegeneship_verification": doc._academic_criteria.Indegeneship_verification || "null",

                "Indigeneship_Status": doc._academic_criteria.indigeneship_status || "null", // "undergraduate",
                "Studentship_Status": doc._academic_criteria.studentship_status || "null", // "BDG",
                "Cgpa_value": doc._academic_criteria.cgpa_value || "null",

                "Amount_due": doc._academic_criteria.amount_due || 0,



                "Cbt_Score": doc._academic_criteria.cbt_score || "null", // "BDG",
                "cgpa": doc._academic_criteria.cgpa || "null", // "undergraduate",

                "Edu_Level": doc._fields.edu_level || "null", // "undergraduate",
                "Division": doc._fields.applicant_division || "null", // "BDG",

                "Grant": doc._fields.grant_name || "null", // "Lagos State Bursary",
                "Grant_Type": doc._fields.grant_type || "null",
                "Applied_As": doc._fields.initially_submitted_as || "null",


                "Email": doc.$join._fields.email || "null", //: "tochi345@lssb.net",
                // username: "tochi345",
                // password: "#ENCRYPTED#",

                "Phone_No": doc.$join._fields.phone_no || "null", //: "08021132789",
                "NIN": doc.$join._fields.nin || "null", //: "8944ygjklgh",
                "Date_of_Birth": doc.$join._fields.dob || "null", //: "12-june-1780",


                // application_year: "2024-2025",
                // doc.application_year_code: "2425",


                "Academic_Result": doc._fields.academic_result || "null",// "4.0",
                "Application_Status": doc._fields.application_status || "null",// : "pending",
                "Matric_No": doc._fields.matric_no || "null",// "388HJ79707",
                "Current_Level": doc._fields.current_level || "null",  //"300L",
                "Course": doc._fields.course || "null", // "Medicine & Surgery",
                "Study_Duration": doc._fields.study_duration || "null",// "NILL",
                "Year_of_Admission": doc._fields.year_of_admission || "null", // "2020",
                "Year_of_Completion": doc._fields.year_of_completion || "null", // "2024",

                "Bank_name": doc._fields.Bank_name || "null", // "2024",
                "Bank_account": doc._fields.Bank_account || "null", // "2024",
                "Bank_Account_name": doc._fields.Account_name || "null", // "2024",

                "Refree": doc._fields.refree || "null", // "Mrs. Jane Doe",
                "Refree_Phone": doc._fields.refree_phone || "null", // "07578980907",
                "Refree_Address": doc._fields.refree_address || "null", // "180, Logan street, Lagos",
                "Application_Num": doc._fields.application_num || "null", // "LSSBBUR12425T1A17894",
                "Date_Applied": doc.$created_on$ || "null", // "LSSBBUR12425T1A17894",


                "_id": doc._id

            };

            responseData.push(docUse);


        });


        return { success: true, statusCode: 200, data: { data: responseData } }

        // return { success: true, statusCode: 200, data: { data: db_get_response.documents } }
        // return { success: true, statusCode: 200, data: { msg: 'OK', data: [{_id: 'kjhb', fullname: 'vicman', $connections$: {}, isFollowing: true, displayPhoto: 'http://localhost:3150//cpfl/2024/04/ximg8-21712666234026.jpeg' },
        //     {_id: 'kjhjnjmb', fullname: 'Dunsin', $connections$: {}, isFollowing: false, displayPhoto: 'http://localhost:3150//cpfl/2024/04/ximg111712666098553.jpg' }
        // ] } }
    }

    return { success: false, statusCode: 500, error: { msg: 'Error Fetching' } }


}
