// connections_worker

// import { readdir } from 'node:fs/promises';
import fs from 'node:fs';
import { unlink } from "node:fs/promises";

// import { join } from 'node:path';
// const { check_or_setup_collection } = await import('./_lib_/check_or_setup_collection.js');
const excelToJson = require('convert-excel-to-json');

let json2xls = require('json2xls');

const thisWorker = {};

console.log('Batch worker running ');

// npm i convert-excel-to-json
// npm i json2xls

// thisWorker.count = 0;

// thisWorker.indexObj = {};

// thisWorker.cacheObj = {};

// thisWorker.admin_report = {};

// @@ --list dir BUn

// https://bun.sh/docs/api/glob

// https://stackoverflow.com/questions/77097856/list-files-in-directory-with-bun

// import { Glob } from "bun";

// const glob = new Glob("*");

// for (const file of glob.scanSync(".")) {
//     console.log(file);
// }


// @@ comments should sit in cache with a time based sort cache for now..
// @@ comment are partitioned by parent resource ID
// @@ -- leter implementation of comments has latest 10 in parent resource then caching
// @@ -- on demand


// @@ for now, before Goroutine, all comments reside in the folder id folder.. 
// @@ items size in nodes have been raised to 50k...
// -- do all goroutine shit before 50k..

// -- Go routine next... caching, pointers etc.. high speed queries via goroutines etc

// -- structs if they behave like maps.. sorting arrays... 

// --- caches should bne multiple objects..

// -- backgroud workres etc..



// @@ -- no comments chronological order for now


let test_= [
    {
        "_fields": {
            "fullname": "Test One",
            "email": "appli_one@lssb.net",
            "username": "test_one",
            "phone_no": "08061132789",
            "nin": "908jlhkj44ygjklgh",
            "lassra": "LASS908jj44ygjklgh",
            "dob": "12-june-1680"
        },
        "$created_on$": "2024-07-16T13:00:46.320Z",
        "_id": "USV96V3Vx1h1k3U4Q8D406t3c3Vh1V1",
        "_applications": {
            "lagos_state_bursary": {
                "application_num": "LSSBLSB2425T1A16138",
                "_id": "APV99V1VH1j3P4d6Y3D946d1v5Vh1V1"
            },
            "lagos_state_scholarship_award": {
                "application_num": "LSSBLSSA2425T1A18864",
                "_id": "APV96V1Vu3P2A1I5S5P1D8z8c7Vh1V1"
            }
        }
    },
    {
        "_fields": {
            "fullname": "Adeola Test",
            "email": "adeola12@llsb.net",
            "username": "adeola12",
            "phone_no": "08021132789",
            "nin": "GH88ygjklgh",
            "dob": "12-june-1780"
        },
        "$created_on$": "2024-07-15T08:08:27.719Z",
        "_id": "USV99V3Vb1P0q3n0T9h0e7B7S2Vh1V1"
    },
    {
        "_fields": {
            "email": "tochi345@lssb.net",
            "username": "tochi345",
            "phone_no": "08021132789",
            "nin": "8944ygjklgh",
            "dob": "12-june-1780",
            "fullname": "Kelvin Bassey"
        },
        "$created_on$": "2024-07-15T08:09:31.069Z",
        "_id": "USV98V3Vq1S0n3B0B9n751X0b7Vh1V1",
        "_invoices": {
            "bursary": {
                "pay_status": "Paid"
            }
        }
    },
    {
        "_fields": {
            "fullname": "Temitope Okechukwu Muhammed",
            "email": "testvic@lssb.net",
            "username": "test_vic",
            "phone_no": "08061132789",
            "nin": "90844ygjklgh",
            "dob": "12-june-1680"
        },
        "$created_on$": "2024-07-16T08:00:56.448Z",
        "_id": "USV97V3VE1c1M1F6U8H5r6H4d5Vh1V1",
        "_applications": {
            "lagos_state_bursary": {
                "application_num": "LSSBLSB2425T1A12172",
                "_id": "APV97V1VG2l9G3D2D4Q062z2f6Vh1V1"
            }
        }
    },
    {
        "_fields": {
            "email": "user_email1@email.test",
            "fullname": "Surname001 firstname-001",
            "username": "lssb_user1",
            "division": "BDG",
            "phone_no": "080112233-1",
            "nin": "NIN1-34984fr",
            "lassra": "LASR1-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:16.091Z",
        "_id": "USV100V1VQ4h7W5B419a156T039Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email2@email.test",
            "fullname": "Surname002 firstname-002",
            "username": "lssb_user2",
            "division": "Lagos",
            "phone_no": "080112233-2",
            "nin": "NIN2-34984fr",
            "lassra": "LASR2-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:16.515Z",
        "_id": "USV99V1Vc4M7W5b4e9x1i6X5M1Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email3@email.test",
            "fullname": "Surname003 firstname-003",
            "username": "lssb_user3",
            "division": "IKJ",
            "phone_no": "080112233-3",
            "nin": "NIN3-34984fr",
            "lassra": "LASR3-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:16.924Z",
        "_id": "USV98V1V04L7J564q9g156x9Y2Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email4@email.test",
            "fullname": "Surname004 firstname-004",
            "username": "lssb_user4",
            "division": "EPE",
            "phone_no": "080112233-4",
            "nin": "NIN4-34984fr",
            "lassra": "LASR4-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:17.334Z",
        "_id": "USV97V1VM4S7U5J4P9r1W7B3O3Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email5@email.test",
            "fullname": "Surname005 firstname-005",
            "username": "lssb_user5",
            "division": "IKD",
            "phone_no": "080112233-5",
            "nin": "NIN5-34984fr",
            "lassra": "LASR5-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:17.743Z",
        "_id": "USV96V1Vd4q7z524J9f1G737R4Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email6@email.test",
            "fullname": "Surname006 firstname-006",
            "username": "lssb_user6",
            "division": "BDG",
            "phone_no": "080112233-6",
            "nin": "NIN6-34984fr",
            "lassra": "LASR6-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:18.153Z",
        "_id": "USV95V1Vv4t7u5P4E9c1A8P1b5Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email7@email.test",
            "fullname": "Surname007 firstname-007",
            "username": "lssb_user7",
            "division": "Lagos",
            "phone_no": "080112233-7",
            "nin": "NIN7-34984fr",
            "lassra": "LASR7-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:18.565Z",
        "_id": "USV94V1Vm4d765m4f9q1k8x5W6Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email8@email.test",
            "fullname": "Surname008 firstname-008",
            "username": "lssb_user8",
            "division": "IKJ",
            "phone_no": "080112233-8",
            "nin": "NIN8-34984fr",
            "lassra": "LASR8-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:18.973Z",
        "_id": "USV93V1Vb4r7S5e4U9l1T8b9P7Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email9@email.test",
            "fullname": "Surname009 firstname-009",
            "username": "lssb_user9",
            "division": "EPE",
            "phone_no": "080112233-9",
            "nin": "NIN9-34984fr",
            "lassra": "LASR9-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:19.383Z",
        "_id": "USV92V1Vy4N7Y5g4k9L1x9w3e8Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email10@email.test",
            "fullname": "Surname010 firstname-010",
            "username": "lssb_user10",
            "division": "IKD",
            "phone_no": "080112233-10",
            "nin": "NIN10-34984fr",
            "lassra": "LASR10-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:19.792Z",
        "_id": "USV91V1Vw4L7c5Q4h9o1O9M7Y9Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email11@email.test",
            "fullname": "Surname011 firstname-011",
            "username": "lssb_user11",
            "division": "BDG",
            "phone_no": "080112233-11",
            "nin": "NIN11-34984fr",
            "lassra": "LASR11-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:20.202Z",
        "_id": "USV90V1VB4K7M5c4H9I2j0L2F0Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email12@email.test",
            "fullname": "Surname012 firstname-012",
            "username": "lssb_user12",
            "division": "Lagos",
            "phone_no": "080112233-12",
            "nin": "NIN12-34984fr",
            "lassra": "LASR12-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:20.611Z",
        "_id": "USV89V1VD4v7w5h4u9I2b0L641Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email13@email.test",
            "fullname": "Surname013 firstname-013",
            "username": "lssb_user13",
            "division": "IKJ",
            "phone_no": "080112233-13",
            "nin": "NIN13-34984fr",
            "lassra": "LASR13-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:21.022Z",
        "_id": "USV88V1VH4p7g5q4P9t2E1r0j2Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email14@email.test",
            "fullname": "Surname014 firstname-014",
            "username": "lssb_user14",
            "division": "EPE",
            "phone_no": "080112233-14",
            "nin": "NIN14-34984fr",
            "lassra": "LASR14-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:21.432Z",
        "_id": "USV87V1Vt4T7u5R4z9X2g1O4N3Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email15@email.test",
            "fullname": "Surname015 firstname-015",
            "username": "lssb_user15",
            "division": "IKD",
            "phone_no": "080112233-15",
            "nin": "NIN15-34984fr",
            "lassra": "LASR15-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:21.841Z",
        "_id": "USV86V1V34U755B4H9B2n1s8G4Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email16@email.test",
            "fullname": "Surname016 firstname-016",
            "username": "lssb_user16",
            "division": "BDG",
            "phone_no": "080112233-16",
            "nin": "NIN16-34984fr",
            "lassra": "LASR16-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:22.250Z",
        "_id": "USV85V1Vp4w7X5d4y9D2M2s2R5Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email17@email.test",
            "fullname": "Surname017 firstname-017",
            "username": "lssb_user17",
            "division": "Lagos",
            "phone_no": "080112233-17",
            "nin": "NIN17-34984fr",
            "lassra": "LASR17-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:22.659Z",
        "_id": "USV84V1Va4Q7P5K4u9u2N2l646Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email18@email.test",
            "fullname": "Surname018 firstname-018",
            "username": "lssb_user18",
            "division": "IKJ",
            "phone_no": "080112233-18",
            "nin": "NIN18-34984fr",
            "lassra": "LASR18-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:23.069Z",
        "_id": "USV83V1VZ4M7o5C4D9i2E3R0R6Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email19@email.test",
            "fullname": "Surname019 firstname-019",
            "username": "lssb_user19",
            "division": "EPE",
            "phone_no": "080112233-19",
            "nin": "NIN19-34984fr",
            "lassra": "LASR19-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:23.478Z",
        "_id": "USV82V1Vl4v7U5t4b9Y2c3v4X7Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email20@email.test",
            "fullname": "Surname020 firstname-020",
            "username": "lssb_user20",
            "division": "IKD",
            "phone_no": "080112233-20",
            "nin": "NIN20-34984fr",
            "lassra": "LASR20-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:23.887Z",
        "_id": "USV81V1Vh4l7A5m4S9g2b3j8G8Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email21@email.test",
            "fullname": "Surname021 firstname-021",
            "username": "lssb_user21",
            "division": "BDG",
            "phone_no": "080112233-21",
            "nin": "NIN21-34984fr",
            "lassra": "LASR21-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:24.298Z",
        "_id": "USV80V1Va447q5w4Q9r2q4l2W9Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email22@email.test",
            "fullname": "Surname022 firstname-022",
            "username": "lssb_user22",
            "division": "Lagos",
            "phone_no": "080112233-22",
            "nin": "NIN22-34984fr",
            "lassra": "LASR22-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:24.708Z",
        "_id": "USV79V1VY4L7q5X4o9L2t4i7n0Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email23@email.test",
            "fullname": "Surname023 firstname-023",
            "username": "lssb_user23",
            "division": "IKJ",
            "phone_no": "080112233-23",
            "nin": "NIN23-34984fr",
            "lassra": "LASR23-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:25.117Z",
        "_id": "USV78V1Vw4J7g5L4G9G245f1D1Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email24@email.test",
            "fullname": "Surname024 firstname-024",
            "username": "lssb_user24",
            "division": "EPE",
            "phone_no": "080112233-24",
            "nin": "NIN24-34984fr",
            "lassra": "LASR24-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:25.526Z",
        "_id": "USV77V1Vo4n7b5w4G9U2R5G5Z2Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email25@email.test",
            "fullname": "Surname025 firstname-025",
            "username": "lssb_user25",
            "division": "IKD",
            "phone_no": "080112233-25",
            "nin": "NIN25-34984fr",
            "lassra": "LASR25-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:25.935Z",
        "_id": "USV76V1Vp4w7Y554m9h2U519A3Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email26@email.test",
            "fullname": "Surname026 firstname-026",
            "username": "lssb_user26",
            "division": "BDG",
            "phone_no": "080112233-26",
            "nin": "NIN26-34984fr",
            "lassra": "LASR26-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:26.345Z",
        "_id": "USV75V1VD457X5T4N9M2w6m3E4Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email27@email.test",
            "fullname": "Surname027 firstname-027",
            "username": "lssb_user27",
            "division": "Lagos",
            "phone_no": "080112233-27",
            "nin": "NIN27-34984fr",
            "lassra": "LASR27-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:26.754Z",
        "_id": "USV74V1Vh4G7b5B4T902g627X5Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email28@email.test",
            "fullname": "Surname028 firstname-028",
            "username": "lssb_user28",
            "division": "IKJ",
            "phone_no": "080112233-28",
            "nin": "NIN28-34984fr",
            "lassra": "LASR28-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:27.163Z",
        "_id": "USV73V1VJ4j7p5t4D9R2u7P1L6Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email29@email.test",
            "fullname": "Surname029 firstname-029",
            "username": "lssb_user29",
            "division": "EPE",
            "phone_no": "080112233-29",
            "nin": "NIN29-34984fr",
            "lassra": "LASR29-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:27.571Z",
        "_id": "USV72V1Vr4h7P5m409q247G5c7Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email30@email.test",
            "fullname": "Surname030 firstname-030",
            "username": "lssb_user30",
            "division": "IKD",
            "phone_no": "080112233-30",
            "nin": "NIN30-34984fr",
            "lassra": "LASR30-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:27.982Z",
        "_id": "USV71V1Vr4w7B5w4S912Y7x9B8Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email31@email.test",
            "fullname": "Surname031 firstname-031",
            "username": "lssb_user31",
            "division": "BDG",
            "phone_no": "080112233-31",
            "nin": "NIN31-34984fr",
            "lassra": "LASR31-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:28.392Z",
        "_id": "USV70V1Vv4J7X5x4S9C2r8r3a9Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email32@email.test",
            "fullname": "Surname032 firstname-032",
            "username": "lssb_user32",
            "division": "Lagos",
            "phone_no": "080112233-32",
            "nin": "NIN32-34984fr",
            "lassra": "LASR32-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:28.802Z",
        "_id": "USV69V1Vl4v7I5p4a9r2R8z8Z0Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email33@email.test",
            "fullname": "Surname033 firstname-033",
            "username": "lssb_user33",
            "division": "IKJ",
            "phone_no": "080112233-33",
            "nin": "NIN33-34984fr",
            "lassra": "LASR33-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:29.212Z",
        "_id": "USV68V1Vv4Z7v5O41962W9J2Y1Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email34@email.test",
            "fullname": "Surname034 firstname-034",
            "username": "lssb_user34",
            "division": "EPE",
            "phone_no": "080112233-34",
            "nin": "NIN34-34984fr",
            "lassra": "LASR34-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:29.621Z",
        "_id": "USV67V1VG4t7v5v4r9t2n9T6U2Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email35@email.test",
            "fullname": "Surname035 firstname-035",
            "username": "lssb_user35",
            "division": "IKD",
            "phone_no": "080112233-35",
            "nin": "NIN35-34984fr",
            "lassra": "LASR35-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:30.030Z",
        "_id": "USV66V1Vc4h7t5A4D9T3e0Z0R3Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email36@email.test",
            "fullname": "Surname036 firstname-036",
            "username": "lssb_user36",
            "division": "BDG",
            "phone_no": "080112233-36",
            "nin": "NIN36-34984fr",
            "lassra": "LASR36-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:30.439Z",
        "_id": "USV65V1VE4r7X534u9C3Q0Z4c3Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email37@email.test",
            "fullname": "Surname037 firstname-037",
            "username": "lssb_user37",
            "division": "Lagos",
            "phone_no": "080112233-37",
            "nin": "NIN37-34984fr",
            "lassra": "LASR37-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:30.850Z",
        "_id": "USV64V1VW4S7P5s4P9Y3A0r8H5Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email38@email.test",
            "fullname": "Surname038 firstname-038",
            "username": "lssb_user38",
            "division": "IKJ",
            "phone_no": "080112233-38",
            "nin": "NIN38-34984fr",
            "lassra": "LASR38-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:31.258Z",
        "_id": "USV63V1Vv4J7L5v4X9n3M1w2j5Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email39@email.test",
            "fullname": "Surname039 firstname-039",
            "username": "lssb_user39",
            "division": "EPE",
            "phone_no": "080112233-39",
            "nin": "NIN39-34984fr",
            "lassra": "LASR39-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:31.667Z",
        "_id": "USV62V1VS4K715v4O9q3a1A6Q6Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email40@email.test",
            "fullname": "Surname040 firstname-040",
            "username": "lssb_user40",
            "division": "IKD",
            "phone_no": "080112233-40",
            "nin": "NIN40-34984fr",
            "lassra": "LASR40-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:32.078Z",
        "_id": "USV61V1VM4U725y4i9X3z2b0o7Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email41@email.test",
            "fullname": "Surname041 firstname-041",
            "username": "lssb_user41",
            "division": "BDG",
            "phone_no": "080112233-41",
            "nin": "NIN41-34984fr",
            "lassra": "LASR41-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:32.488Z",
        "_id": "USV60V1Vr4c7S5h4j9X3C2A4n8Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email42@email.test",
            "fullname": "Surname042 firstname-042",
            "username": "lssb_user42",
            "division": "Lagos",
            "phone_no": "080112233-42",
            "nin": "NIN42-34984fr",
            "lassra": "LASR42-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:32.898Z",
        "_id": "USV59V1V24L7u544G9C3C2M8m9Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email43@email.test",
            "fullname": "Surname043 firstname-043",
            "username": "lssb_user43",
            "division": "IKJ",
            "phone_no": "080112233-43",
            "nin": "NIN43-34984fr",
            "lassra": "LASR43-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:33.308Z",
        "_id": "USV58V1VD4h7M5P4S9F3v3e3n0Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email44@email.test",
            "fullname": "Surname044 firstname-044",
            "username": "lssb_user44",
            "division": "EPE",
            "phone_no": "080112233-44",
            "nin": "NIN44-34984fr",
            "lassra": "LASR44-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:33.718Z",
        "_id": "USV57V1V24m7F5y4h9x3m3c7t1Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email45@email.test",
            "fullname": "Surname045 firstname-045",
            "username": "lssb_user45",
            "division": "IKD",
            "phone_no": "080112233-45",
            "nin": "NIN45-34984fr",
            "lassra": "LASR45-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:34.127Z",
        "_id": "USV56V1V04d7Y5I4T9c3d4e1N2Vh1V1"
    },
    {
        "_fields": {
            "email": "user_email46@email.test",
            "fullname": "Surname046 firstname-046",
            "username": "lssb_user46",
            "division": "BDG",
            "phone_no": "080112233-46",
            "nin": "NIN46-34984fr",
            "lassra": "LASR46-90364",
            "dob": "12-june-1998"
        },
        "_academic_criteria": {
            "studentship_status": "pending",
            "indigeneship_status": "pending"
        },
        "$created_on$": "2024-08-27T10:35:34.537Z",
        "_id": "USV55V1VF4g7v504S9c3X4c5p3Vh1V1"
    }
];


const run_excel = function() {

    let json2Export = [];
    test_.forEach( obj => {

        json2Export.push({
            
            Fullname: obj._fields.fullname || "Null",
            Email: obj._fields.email || "Null",
            Username: obj._fields.username || "Null",
            NIN: obj._fields.nin || "Null",
            LASRRA: obj._fields.lassra || "Null",
            Studentship: obj._academic_criteria ? obj._academic_criteria.studentship_status : "Unconfirmed",
            Indigeneship: obj._academic_criteria ? obj._academic_criteria.indigeneship_status : "Unconfirmed",
            Date: obj.$created_on$.split('T')[0],
            Applicant_Id: obj._id

        })
    })



    var xls = json2xls(json2Export);

    let file_name = 'LSSB_Export_2024' + Date.now();

    let file_path = `../../_exports/${file_name}.xlsx`;

    fs.writeFileSync(file_path, xls, 'binary');

    console.log('json2Export ---> ', json2Export );

};


// run_excel();

// Worker thread:
self.addEventListener("message", async (event) => {

    setTimeout(function () {

        console.log('db Message received ::: ---- >', event.data);

    }, 600);

    // const work_id = event.data.job + '_' + Date.now();
    // const work_id = event.data.job + '_' + Date.now();

    // let job = { ...event.data };
    thisWorker.config = event.data.config;

    if (typeof thisWorker[event.data.fnc] == 'function') {

        await thisWorker[event.data.fnc](event.data, process);

        if (event.data.fnc == 'create_or_scan') {

            // thisWorker.create_or_scan();

            delete thisWorker.indexObj.undefined;

            self.postMessage({
                commentsCache: thisWorker.cacheObj
            })

            process.exit();
        }

        if (event.data.fnc == 'fetch_admin_report') {

            // thisWorker.create_or_scan();

            // delete thisWorker.indexObj.undefined;

            self.postMessage({
                admin_report: thisWorker.admin_report
            })

            process.exit();
        }

        process.exit();
    }

    else {
        process.exit();
    }

    // let current_fnc = job.fnc;

    // SqyWorker.queue.set(work_id, job);
    // let res = await SqyWorkerFncs[current_fnc](job.data);

    // if (res == 'done') {

    console.log(' Job done . db_worker ---->', event.data.fnc);


});



thisWorker.run_batch_on_db_from_file = async function (options_, process) {


    if ( !options_.update_type ) {

        process.exit();
    }

    // https://www.npmjs.com/package/convert-excel-to-json

    const result = excelToJson({
        sourceFile: options_.file_path,
        header: {
            // Is the number of rows that will be skipped and will not be present at our result object. Counting from top to bottom
            rows: 1 // 2, 3, 4, etc.
        },
        columnToKey: {
            '*': '{{columnHeader}}'
        },
        columnToKey_: {
            'A': '{{A1}}',
            'B': '{{B1}}',
            'C': '{{C1}}',
            'D': '{{D1}}',
            'E': '{{E1}}',
            'F': '{{F1}}',
            'G': '{{G1}}',
            'H': '{{H1}}',
        }

    });


    let Sheet1 = Object.keys(result)[0];
    // console.log( ' running DB batch on file :: ----->>> ', options_, '\n result :-: -> ', 'result', result[Sheet1] );


    // @@ --
    if (result[Sheet1].length < 1) { 


        // @@ --- send empty mail to options.uploader_email
        

        return

    }


    // @@ check that an _id exists for 
    if ( !result[Sheet1][0].Applicant_Id) { 


        // @@ --- send empty mail to options.uploader_email


        return

    }


    // @@ ---- do batch updated


    console.log( ' running DB batch on file :: ----->>> ', options_, '\n result :-: -> ', 'result :: ', result[Sheet1][0].Applicant_Id );

    // {
    //     "_fields": {
    //         "fullname": "Test One",
    //         "email": "appli_one@lssb.net",
    //         "username": "test_one",
    //         "phone_no": "08061132789",
    //         "nin": "908jlhkj44ygjklgh",
    //         "lassra": "LASS908jj44ygjklgh",
    //         "dob": "12-june-1680"
    //     },
    //     "$created_on$": "2024-07-16T13:00:46.320Z",
    //     "_id": "USV96V3Vx1h1k3U4Q8D406t3c3Vh1V1",
    //     "_applications": {
    //         "lagos_state_bursary": {
    //             "application_num": "LSSBLSB2425T1A16138",
    //             "_id": "APV99V1VH1j3P4d6Y3D946d1v5Vh1V1"
    //         },
    //         "lagos_state_scholarship_award": {
    //             "application_num": "LSSBLSSA2425T1A18864",
    //             "_id": "APV96V1Vu3P2A1I5S5P1D8z8c7Vh1V1"
    //         }
    //     }
    // },

    // process.exit();
    // thisWorker.update_many_by_username({
    //     data: result.Sheet1

    // });

    let options = {

        db_action: 'run_batch',
        data: result[Sheet1],
        update_type: options_.update_type || 'studentship', // indigeneship, studentship, studentship_and_indigeneship, indigeneship, cbt, cgpa 
    }

    const response = await fetch('http://localhost:6011/', {
        method: "POST",
        body: JSON.stringify(options),
        headers: { "Content-Type": "application/json" },
    });
    

    const body = await response.json();

    console.log('266 Run Batch response -====---->><<<<<<<<>>>>> ', body );

    return




}




thisWorker.update_many_by_ = async function (options) {


    try {

        console.log(' check_or_setup_collection function running ---->');

        // check_or_setup_collection(options);

        process.exit();


    } catch (error) {

        console.log('error 00 --> ', error);

    }


}





