/**
 * Set the necessary hesaders for the backend
 * Most of this would need changing to disfavor CORS
 */
export const backendHeaders = {


    apiHeaders: {
        'Content-Type': 'application/json',
        'X-Powered-By': 'Backend One',

        // for prod
        // 'Access-Control-Allow-Origin': 'http://localhost:8888',

        // for file://
        'Access-Control-Allow-Origin': '*',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

        'X-XSS-Protection': '1; mode=block',
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "script-src 'self'",
        'X-Content-Security-Policy': "default-src 'self' ;options inline-script eval-script;referrer no-referrer;img-src 'self' data:  *.tile.openstreetmap.org;object-src 'none'",
        'X-Content-Type-Options': 'nosniff',
        'X-Permitted-Cross-Domain-Policies': 'none',
        'X-Robots-Tag': 'noindex, nofollow',
        'Pragma': 'no-cache',
        'Referrer-Policy': 'no-referrer',



        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH', // If needed
        // 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE, x-http-method-override', // If needed

            // for 
        // 'Access-Control-Allow-Headers': 'content-type, Accept, ~~~post, ~~~get, ~~~put, ~~~patch, ~~~delete, Authorization', // If needed
        'Access-Control-Allow-Headers': 'Connection, Host, Custom-Header, Content-Type, Accept, Authorization, ', // If needed

        'Access-Control-Allow-Credentials': true // If needed ,
        // "Origin, X-Requested-With, Content-Type, Accept"
    },
    staticHeaders: {
        // 'Access-Control-Allow-Methods': 'POST',
        // 'Content-Type': 'text/plain',
        // 'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
        'X-is-verified': '2U0d7q9E4x4D8d1I4m4x4g1m0n',
        'Content-Security-Policy': "script-src 'self'",
        'X-Content-Security-Policy': "default-src 'self' ;options inline-script eval-script;referrer no-referrer;img-src 'self' data:  *.tile.openstreetmap.org;object-src 'none'",
        'X-Content-Type-Options': 'nosniff',
    }


} 


