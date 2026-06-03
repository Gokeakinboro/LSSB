// doc.live.js

auth_admin: 'LSSB_admin',

fetch_admins: 'LSSB_admin',


create_admin: 'LSSB_admin',


fetch_report: 'LSSB_admin', ----------------------------------------- //

let res = await LSSB.make_API_call({

    $k: admin_token,
    _endpoint: 'fetch_report',

});

// response

{
    success: true,
    statusCode: 404,
    data: {
      msg: "OK",
      report: {
        grants_count: 3,
        applicants_count: 3,
        applications_count: 2,
        bursary_count: 0,
        scholarship_count: 0,
        total_pending_pay: 0,
      },
    },
  } 

// Error ---

{ success: false, statusCode: 500, error: { msg: 'Error Fetching Admin Stats' } }

use_pin: 'LSSB_PINs',
fetch_pins: 'LSSB_PINs',
create_pin: 'LSSB_PINs',
delete_pin: 'LSSB_PINs',

let res = await LSSB.make_API_call({

        $k: admin_token,
        _endpoint: 'delete_pin',
        _id: "k96V1VR1vjkbn1X409X0N443q141Vh1V1",

    });

create_applicant: 'LSSB_applicants',
auth_applicant: 'LSSB_applicants',
update_applicant: 'LSSB_applicants',



fetch_applicants: 'LSSB_applicants',

// 1. Only admins can fetch fetch_applicants.

initiate_payment: 'LSSB_applicants',
check_payment_status: 'LSSB_applicants',

create_application: 'LSSB_applications',
fetch_applications: 'LSSB_applications', // @@ only admin
// fetch_user_applications: 'LSSB_applications', // @@ called by user gets applications by that user


update_application: 'LSSB_applications',

nullify_application: 'LSSB_applications',

create_grant: 'LSSB_grants',

let res = await LSSB.make_API_call({

        _endpoint: 'create_grant',
        $k: admin_token,
        _fields: {

            grant_status: 'open', // -- closed, live etc
            grant_type: 'bursary',
            grant_access_mode: 'paid', // @@ paid, free
            grant_name: 'Lagos State Bursary',

        }

    });

fetch_grant: 'LSSB_grants',
fetch_grants: 'LSSB_grants',
 let res = await LSSB.make_API_call({

        $k: admin_token,//user.token,
        _endpoint: 'fetch_grants',
        $where: { '_fields.grant_type': 'scholarship' },
        // $search: { '_fields.grant_name': 'Non' },
        // $search: { '_fields.grant_name': 'Lago' },
        // $where: { '_fields.grant_type': 'bursary' },
        // $where_not: { '_fields.grant_type': 'bursary' },
        $page: 1,
        $items_per_page: 10,
        // $date_range: ['2024-04-10','2024-07-27'], // year- month -day
        $date_range: ['2024-07-22'],
        // $search: { '_fields.grant_type': 'bur' },

    });



    let res = await LSSB.make_API_call({

        $k: admin_token,//user.token,
        _endpoint: 'fetch_grants',
        $where: { '_fields.grant_type': 'scholarship' },
        // $search: { '_fields.grant_name': 'Non' },
        // $search: { '_fields.grant_name': 'Lago' },
        // $where: { '_fields.grant_type': 'bursary' },
        // $where_not: { '_fields.grant_type': 'bursary' },
        $page: 1,
        $items_per_page: 10,
        // $date_range: ['2024-04-10','2024-07-27'], // year- month -day
        $date_range: ['2024-07-22'],
        // $search: { '_fields.grant_type': 'bur' },

    });

update_grant: 'LSSB_grants',
delete_grant: 'LSSB_grants',

let res = await LSSB.make_API_call({

        $k: admin_token,//user.token,
        _endpoint: 'delete_grant',
        _id: "11997V1Vh2A1E1k9U8c9H1A8v5Vh1V1",

    });

    let res = await LSSB.make_API_call({

        $k: admin_token,//user.token,
        _endpoint: 'fetch_grants',
        $where: { _id: "11999V1Vu1u0v4E2N221u6e8e3Vh1V1" },

    });
