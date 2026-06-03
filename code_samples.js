

spawning && Argv


const { stdout, stderr } = Bun.spawn(["ls", "-l", "./testdata/"]);
const stdoutStr = await new Response(stdout).text();
const stderrStr = await new Response(stderr).text();
console.log("STDOUT:", stdoutStr, ", STDERR:", stderrStr);


import { exec } from "node:child_process";
exec("ls -l ./testdata/", (error, stdout, stderr) => {
  console.log("STDOUT:", stdout, ", STDERR:", stderr);
});

// https://medium.com/deno-the-complete-reference/run-shell-command-and-collect-the-output-in-node-js-deno-and-bun-f23977bf1d68








const proc = Bun.spawn(["echo", "hello"]);

// await completion
await proc.exited;

const proc = Bun.spawn("echo", ["Hello, world!"], {
    cwd: "/tmp",
    env: { FOO: "bar" },
    onExit(proc, exitCode, signalCode, error) {
        // exit handler
    },
});

// By default, the stdout of the child process can be consumed as a ReadableStream using proc.stdout.
const proc = Bun.spawn(["echo", "hello"]);

const output = await new Response(proc.stdout).text();
output; // => "hello"

// https://bun.sh/guides/process/spawn


https://bun.sh/guides/process/argv

// https://bun.sh/docs/api/http
Bun.serve({
    fetch(req) {
        return new Response("Bun!");
    },
});


Bun.serve({
    fetch(req) {
        const url = new URL(req.url);
        if (url.pathname === "/") return new Response("Home page!");
        if (url.pathname === "/blog") return new Response("Blog!");
        return new Response("404!");
    },
});

To configure which port and hostname the server will listen on:



Bun.serve({
    port: 8080, // defaults to $BUN_PORT, $PORT, $NODE_PORT otherwise 3000
    hostname: "mydomain.com", // defaults to "0.0.0.0"
    fetch(req) {
        return new Response("404!");
    },
});











https://bun.sh/docs/quickstart
https://transform.tools/typescript-to-javascript
// https://transform.tools/json-to-typescript
bun add figlet

import figlet from "figlet";

const server = Bun.serve({
    port: 3000,
    fetch(req) {
        const body = figlet.textSync("Bun!");
        return new Response(body);
        return new Response("Bun!");
    },
});

Bun.serve server.stop() doesn't stop server when same port is reused/reuses handlers #6632 --- beautoful code here
https://github.com/oven-sh/bun/issues/6632

How to use the Fetch API in Node.js, Deno, and Bun

https://www.sitepoint.com/fetch-api-node-deno-bun/





https://bun.sh/docs/api/workers
Write a string to a file with Bun
https://bun.sh/guides/write-file/basic
https://bun.sh/guides/read-file/string

https://bun.sh/guides/read-file/json


https://piehost.com/piertc
https://bun.sh/docs/api/utils
https://bun.sh/docs/runtime/hot


https://zed.dev/team
https://zed.dev/features#themes

https://stackoverflow.com/questions/18120909/set-interval-in-node-js-vs-cron-job

What is a Nullish Coalescing Operator or Double Question Mark(??) in JavaScript ?
    https ://www.scaler.com/topics/javascript-nullish-coalescing-operator/





    class Car {
        constructor(name, year) {
            this.name = name;
            this.year = year;
        }
        age(x) {
            return x - this.year;
        }
    }

const date = new Date();
let year = date.getFullYear();

const myCar = new Car("Ford", 2014);
document.getElementById("demo").innerHTML =
    "My car is " + myCar.age(year) + " years old.";




https://bun.sh/docs/api/websockets



// Scan Dir -=======================================

// Glob Docs -----

https://bun.sh/docs/api/glob
https://stackoverflow.com/questions/77097856/list-files-in-directory-with-bun
https://stackoverflow.com/questions/77076206/should-i-import-fs-or-nodefs-in-bun



Write a file incrementally with Bun

https://bun.sh/guides/write-file/filesink

const file = Bun.file("/path/to/file.txt");
const writer = file.writer();

writer.write("lorem");
writer.write("ipsum");
writer.write("dolor");

writer.flush();



w.write("hello");
w.write(Buffer.from("there"));
w.write(new Uint8Array([0, 255, 128]));
writer.flush();



const file = Bun.file("/path/to/file.txt");
const writer = file.writer({ highWaterMark: 1024 * 1024 }); // 1MB



What is Bun: A High - Performance JavaScript Runtime ?

    https ://medium.com/code-crafters/what-is-bun-a-high-performance-javascript-runtime-3aaff50aeef7



    Converting Strings to Numbers
https://www.w3schools.com/js/js_type_conversion.asp

Number("3.14")
Number(Math.PI)
Number(" ")
Number("")




What is a Nullish Coalescing Operator or Double Question Mark(??) in JavaScript ?



// https://stackoverflow.com/questions/77097856/list-files-in-directory-with-bun

import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * @param {string | Buffer | URL} directoryPath
 * @returns {Promise<string[]>} - Array of long file paths
 */
async function getFiles(directoryPath) {

    try {
        const fileNames = await readdir(directoryPath); // returns a JS array of just short/local file-names, not paths.
        const filePaths = fileNames.map(fn => join(directoryPath, fn));
        return filePaths;
    }
    catch (err) {
        console.error(err); // depending on your application, this `catch` block (as-is) may be inappropriate; consider instead, either not-catching and/or re-throwing a new Error with the previous err attached.
    }
}




// https://bun.sh/guides/http/hot

// Write a simple HTTP server with Bun -=======================================

// https://stackoverflow.com/questions/77076206/should-i-import-fs-or-nodefs-in-bun

const server = Bun.serve({
    port: 3000,
    fetch(request) {
        return new Response("Welcome to Bun!");
    },
});

console.log(`Listening on ${server.url}`);

// Read a JSON file with Bun -=======================================
// https://bun.sh/guides/read-file/json
// https://bun.sh/guides/process/stdin
// https://bun.sh/guides/process/spawn
// https://bun.sh/docs/api/spawn
//

const path = "/path/to/package.json";
const file = Bun.file(path);

const contents = await file.json();
// { name: "my-package" }

file.type; // => "application/json;charset=utf-8";






// Built on web standards
// Bun.serve() is built on web standards like Request and Response.

import { serve } from 'bun';


serve({
    async fetch(request) {
        // Read the request body as json
        const body = await request.json();

        const { headers } = request;
        const accept = headers.get("Accept");

        // Return an error if they're not asking for json
        if (accept !== "application/json") {
            return new Response(
                "Expected Accept: application/json header",
                { status: 400 }
            );
        }

        // return a new Response with the body as json
        return Response.json(body);
    }
})




// -==== API Server
// https://medium.com/@code.brew/build-your-first-rest-api-with-bun-18d31b68e42a

// https://www.sitepoint.com/fetch-api-node-deno-bun/

import { serve } from 'bun';

const PORT = 6989;

interface Post {
    id: string;
    title: string;
    content: string;
}

let blogPosts: Post[] = [];

function handleGetPostById(id: string) {
    const post = blogPosts.find((post) => post.id === id);

    if (!post) {
        return new Response("Post Not Found", { status: 404 });
    }

    return new Response(
        JSON.stringify(post),
        { headers: { 'Content-Type': 'application/json' } }
    );
}

function handleGetAllPosts() {
    return new Response(
        JSON.stringify(blogPosts),
        { headers: { 'Content-Type': 'application/json' } }
    );
}

function handleCreatePost(title: string, content: string) {
    const newPost: Post = {
        id: `${blogPosts.length}`,
        title,
        content
    }

    blogPosts.push(newPost);

    return new Response(
        JSON.stringify(newPost),
        {
            headers: { 'Content-Type': 'application/json' },
            status: 201,
        }
    );
}

function handleUpdatePost(id: string, title: string, content: string) {
    const postIndex = blogPosts.findIndex((post) => post.id === id);

    if (postIndex === -1) {
        return new Response("Post Not Found", { status: 404 });
    }

    blogPosts[postIndex] = {
        ...blogPosts[postIndex],
        title,
        content
    }

    return new Response("Post Updated", { status: 200 });
}

function handleDeletePost(id: string) {
    const postIndex = blogPosts.findIndex((post) => post.id === id);

    if (postIndex === -1) {
        return new Response("Post Not Found", { status: 404 });
    }

    blogPosts.splice(postIndex, 1);

    return new Response("Post Deleted", { status: 200 });
}

serve({
    port: PORT,
    async fetch(request: Request) {
        const { method } = request;
        const { pathname } = new URL(request.url);
        const pathRegexForID = /^\/api\/posts\/(\d+)$/;

        if (method === 'GET' && pathname === '/api/posts') {
            return handleGetAllPosts();
        }

        if (method === 'GET') {
            const match = pathname.match(pathRegexForID);
            const id = match && match[1];

            if (id) {
                return handleGetPostById(id);
            }
        }

        if (method === 'POST' && pathname === '/api/posts') {
            const newPost = await request.json();
            return handleCreatePost(newPost.title, newPost.content);
        }

        if (method === 'PATCH') {
            const match = pathname.match(pathRegexForID);
            const id = match && match[1];

            if (id) {
                const editedPost = await request.json();
                return handleUpdatePost(id, editedPost.title, editedPost.content);
            }
        }

        if (method === 'DELETE' && pathname === '/api/posts') {
            const { id } = await request.json();
            return handleDeletePost(id);
        }

        return new Response("Not Found", { status: 404 });
    },
});

console.log(`Listening on http://localhost:${PORT} ...`);
