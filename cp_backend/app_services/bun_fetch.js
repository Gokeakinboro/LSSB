
// https://bun.sh/guides/http/fetch

// bun --watch bun_fetch.js

// pwd
// cd /Applications/MAMP/htdocs/LSSB_Deploy/cp_backend/app_services

async function try_fetch() {

    const responser = await fetch("https://bun.sh");
    const html = await responser.text(); // HTML string

    const response = await fetch("https://bun.sh/api", {
        method: "POST",
        body: JSON.stringify({ message: "Hello from Bun!" }),
        headers: { "Content-Type": "application/json" },
    });

    const body = await response.json();

}

let run_lassra = async function () {



    const myHeaders = new Headers();
    myHeaders.append("token", "bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyZXF1ZXN0IjoiKiIsInVzZXJJRCI6Im1hc3RlcjIiLCJ0cmFuc0RhdGUiOjE2MDk5NzE2MjUsIm1heHJlcXVlc3QiOm51bGwsInB1YmxpY0tleSI6Ik5Mc05yTERYTXRrSU9XNVVWbkVVeWxZayIsImlzQWRtaW4iOjAsImlzc3VlcklEIjoiajQ4aFpsOXE3MDhlTlQyWW1TMDBOWEdkIn0.qn06QGJjojQbtyLtgRAimlsVRmkwpxvwZAxfwaEg_sE");
    myHeaders.append("publicKey", "NLsNrLDXMtkIOW5UVnEUylYk");
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        "data": {
            "route": "/dataservices/getdetails/{lasrraId}"
        }
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    fetch("https://portal-lasrra.touchandpay.me/public/v1/gw/request", requestOptions)
        .then((response) => response.json())
        .then((result) => console.log(result))
        .catch((error) => console.error(error));



}


// run_payment();

run_lassra();

console.log('bunning --');