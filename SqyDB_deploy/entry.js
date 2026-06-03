
import os from 'node:os';
const SqyDB = {};


const cpuCores = os.cpus();
console.log('===<>>>> ', cpuCores[0].toJSON());

const numberOfCPUCores = cpuCores.length;
console.log(numberOfCPUCores); // 👉️ 12

const parallelism = os.availableParallelism();
console.log(parallelism); // 👉️ 12

// using CLI
// node -e "console.log(require('os').cpus().length)"
// https://bobbyhadz.com/blog/get-number-of-cpu-cores-in-node-js
// https://bobbyhadz.com/blog/delete-all-files-in-a-directory-using-node-js

// https://github.com/oven-sh/bun/issues/4286


// @@ -- initialize SqyDB
SqyDB.init = function() {

    console.log(" SqyDB initied ---->", SqyDB );
};