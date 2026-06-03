import fs from 'node:fs';


// bun --watch read_write.js

// rm -r ../_d_data/test_node 

// ls ../_d_data/test_node2

// mkdir ../_d_data/test_node2

// @@ write file

const write_file = async function (options) {

    if (!options || !options.path || !options.name || !options.content) {
        return 'Error:Options'
    }

    return new Promise(async (resolve, reject) => {

        if (typeof options.content !== 'string') {
            options.content = JSON.stringify(options.content);
        }

        await Bun.write(`${options.path || './'}/${options.name}`, options.content);
        resolve('OK');
        // fs.writeFile(`${options.path || './'}/${options.name}`, options.content, function (err) {

        //     if (err) { resolve('Error:Options') }
        //     // console.log('Saved!');
        //     resolve('OK');

        // });

    })
}


const write_many = async function () {

    let u = 0, max = 10000, startTime = Date.now();

    const run_fun = async function () {

        if (u == max + 1) {

            console.log('All Done in ', (Date.now() - startTime) / 1000, 's');
            return
        }

        u++;

        let res = await write_file({
            path: '../_d_data/test_node2/',
            name: `${u}.json`,
            content: { name: u, square: (u * u), $t$: Date.now() }
        })

        if (res == 'OK') { run_fun() }

    }


    run_fun();

}


const scan_files_in_dir_to_map = async function (map) {

    return new Promise((resolve) => {

        let u = 0, max = 10000, startTime = Date.now();

        var dir = '../_d_data/test_node2/';
        let filos = [];

        // 0.075 s

        // fs.readdir(dir, function (err, files) {

        //     files = files.map(function (fileName) {

        //         return {
        //             name: fileName,
        //             // time: fs.statSync(dir + '/' + fileName).mtime.getTime()
        //         }

        //     })
        //     .sort(function (a, b) {

        //         return a.$t$ - b.$t$;

        //     })
        //     .map(function (v) {

        //         // return v.name;
        //         console.log('v ->', v )
        //         filos.push(v.name);

        //     });

        // });

        // console.log(' readFiles 0  :: -->', filos, (Date.now() - startTime) / 1000, 's' );

        filos = fs.readdirSync(dir);
        let readFiles = [], l = filos.length, ll = 0;

        const run_sort = async function () {

            readFiles
                .sort(function (a, b) {
                    return a.$t$ - b.$t$;
                })
                .forEach(doc => {
                    map.set("" + doc.name, doc);
                })

            // callback(map);
            // readFiles
            resolve(map);
            // console.log(' readFiles 0  :: --> ', readFiles, (Date.now() - startTime) / 1000, 's' );
        }

        filos = filos.map(async (file_one) => {

            let fileContent = await Bun.file(`${dir}/${file_one}`).json();
            // return await Bun.file(`${dir}/${file_one}`).json();
            ll++;
            // console.log('fileContent :: -->', fileContent );
            readFiles.push(fileContent);

            if (ll == l) { run_sort() }

        })



        // console.log(' Files --> ', readFiles, (Date.now() - startTime) / 1000, 's');


        // run_fun();

    });

}


const start_1m_reocrds = async function () {

    // let mapOne = new Map(), startTime = Date.now();
    // let res = await scan_files_in_dir_to_map(mapOne);

    // console.log( ' reading and writing --> ', res.get("1600"), (Date.now() - startTime) / 1000, 's');
    let d = {
        "_id": "11994V1Ve3B118p0l7P5D0Q5p3Vh1V1",
        "attr": {
            "author_type": "Profile",
            "template": "post_temp_2",
            "post_font": "font_cursive",
            "post_color": "pallete2",
            "type": "text"
        },
        "postAuthor": {
            "displayPhoto": "http://localhost:3250//cpfl/2024/07/himg317159470850071721945255494.jpg",
            "fullname": "victor Dairo",
            "authorId": "11999V1V11o9j0N6p0y6Z1F3w1Vh1V1",
            "username": "test1"
        },
        "_fields": {
            "text1": "I didn't notice you doing any publicity on it at all",
            "media1x": "null.jpg"
        },
        "$creator$": "t1e0s3t31462836842821e21c1a1",
        "$extras$": {},
        "$connections$": {
            "likes": 1
        },
        "$created_on$": "2024-08-09T05:19:10.531Z",
        "$last_edited_on$": "2024-08-09T05:19:10.531Z",
        "$t$": 1723180750536,
        "hasLiked": false,
        "indexer": 0
    };
    let mapTwo = new Map(), startTime = Date.now();
    let map3 = {};
    let mapKeys = [];
    let str = "4999V1Vz3s6S7h9W7G435i165Vh1V1";

    // @@ 1 million records
    for (let index = 0; index < 1000000; index++) {

        // const element = array[index];
        mapTwo.set(`${str}-${index}`, d);
        mapKeys.push(`${str}-${index}`);
        map3[`${str}-${index}`] = d;

    }

    // console.log( ' reading and writing --> ', res.get("1600"), (Date.now() - startTime) / 1000, 's');

    console.log(' reading and writing --> ', mapTwo.get("4999V1Vz3s6S7h9W7G435i165Vh1V1-1600"), (Date.now() - startTime) / 1000, 's');

    let startTime2 = Date.now();
    // let mapKeys = Array.from(mapTwo.keys());

    console.log(' reading and writing --> ', mapKeys[30000], (Date.now() - startTime2) / 1000, 's');

    let dir = '../_d_data2/dump/';
    await Bun.write(`${dir}/arr.json`, JSON.stringify(mapKeys));
    await Bun.write(`${dir}/map3.json`, JSON.stringify(map3));

}

const sort_1m_reocrds = async function () {

    let dir = '../_d_data2/dump/';
    let mapKeys = await Bun.file(`${dir}/arr.json`).json();
    
    let ml = mapKeys.length;
    let startTime2 = Date.now();

    let result = [];

    for (let index = 0; index < ml; index++) {

        // const element = array[index];
        if (mapKeys[index] == "4999V1Vz3s6S7h9W7G435i165Vh1V1-1600" || mapKeys[index] == "4999V1Vz3s6S7h9W7G435i165Vh1V1-16000") {
            result.push(mapKeys[index]);
        }

    }

    console.log(' reading and writing --> ', result, mapKeys.length, (Date.now() - startTime2) / 1000, 's');

    // reading and writing -->  [ "4999V1Vz3s6S7h9W7G435i165Vh1V1-1600", "4999V1Vz3s6S7h9W7G435i165Vh1V1-16000"
    // ] 1000000 0.015 s

    // @@ for 4 million records
    // -- using mapKeys = [...mapKeys, ...mapKeys, ...mapKeys, ...mapKeys];
    // reading and writing -->  [ "4999V1Vz3s6S7h9W7G435i165Vh1V1-1600", "4999V1Vz3s6S7h9W7G435i165Vh1V1-16000",
    //     "4999V1Vz3s6S7h9W7G435i165Vh1V1-1600", "4999V1Vz3s6S7h9W7G435i165Vh1V1-16000", "4999V1Vz3s6S7h9W7G435i165Vh1V1-1600",
    //     "4999V1Vz3s6S7h9W7G435i165Vh1V1-16000", "4999V1Vz3s6S7h9W7G435i165Vh1V1-1600", "4999V1Vz3s6S7h9W7G435i165Vh1V1-16000"
    //   ] 4000000 0.037 s
      

}

const start = async function () {

    // let mapOne = new Map(), startTime = Date.now();
    // let res = await scan_files_in_dir_to_map(mapOne);

    sort_1m_reocrds();

    // console.log( ' reading and writing --> ', res.get("1600"), (Date.now() - startTime) / 1000, 's');


}


start();