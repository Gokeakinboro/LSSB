/** @typedef {object} json
 * @property {number} userId
 * @property {number} id
 * @property {string} title
 * @property {boolean} completed
 */

{
    "userId": 1,
        "id": 1,
            "title": "delectus aut autem",
                "completed": false
}
// -- schema
// @@ ---> from -- https://transform.tools/json-to-json-schema
{
    "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "Generated schema for Root",
            "type": "object",
                "properties": {
        "userId": {
            "type": "number"
        },
        "id": {
            "type": "number"
        },
        "title": {
            "type": "string"
        },
        "completed": {
            "type": "boolean"
        }
    },
    "required": [
        "userId",
        "id",
        "title",
        "completed"
    ]
}


const log = console.log;

const map = new Map();
// undefined
map.set(`a`, 1);
// Map(1) {"a" => 1}
map.set(`b`, 2);
// Map(1) {"a" => 1, "b" => 2}
map.set(`c`, 3);
// Map(2) {"a" => 1, "b" => 2, "c" => 3}

// Object.fromEntries ✅
const obj = Object.fromEntries(map);

log(`\nobj`, obj);
// obj { a: 1, b: 2, c: 3 }


https://bobbyhadz.com/blog/javascript-extract-number-from-string

https://bobbyhadz.com/blog/javascript-sort-keys-in-map

https://bobbyhadz.com/blog/javascript-convert-map-to-json

https://www.codingbeautydev.com/blog/javascript-convert-map-to-json

https://users.rust-lang.org/t/is-zig-lang-faster-than-rust/70390/14

https://www.w3schools.com/js/js_function_closures.asp