


const { config } = await import('../../_configo_xRF/app_service_config.js');

/**
 * @@ API_processor 
 * @@ processes API requests and responds appropriately
 */
let api_hits = 0;
export const utils = async (reqObject) => {

};


// @@ evf
utils.evf = (i, n, f) => {
    let e = i.indexOf(n),
        r = i.indexOf(f, e);
    if (-1 != e && -1 != r && r >= e) return i.substring(e, r).split(n).join("");
};

utils.ewf = (str, st, en) => {
    var sti = str.indexOf(st);
    var eni = str.indexOf(en, sti);
    if (sti != -1 && eni != -1 && eni >= sti)
        return str.substring(sti, eni) + en
};


// @@ check that a supplied value is not undefined
utils._nu = function (value) { return typeof value !== 'undefined' };

// @@ check that a supplied value is not undefined
utils._lowerCase = function (value) {
    return utils._nu(value) && typeof value == 'string' ? value.toLowerCase() : ''
};


utils.Response = (data, statusCode, success) => {

    // console.log('rr ==> ', statusCode, success);
    let responseObj = {};
    responseObj.success = typeof success == 'undefined' ? true : success;
    responseObj.statusCode = statusCode || 200;
    responseObj.data = data;

    return responseObj;
};



utils.ops_map = {

    'POST_G': "GET",
    'POST_S': "SET",
    'POST_R': "RESET",
    'POST_U': "UNSET",
    'CHECK_EXISTS': 'CHECK_EXISTS'
}
// @@ -- Process Req
// -- extract method, auth, url from Accept
utils.reqHeadProcessor = async (req) => {


    let _h = req.headers, newReqHeader = {}, currentOriginAllowed = false,
        allowedOrigins = config.allowedOrigins, contType = '', acceptLength,
        __accept_h = _h.get('accept');

    // __accept_h = 
    acceptLength = __accept_h && __accept_h.length > 10;

    // console.log('\n 90 _h ======== headers-->', 'headers', acceptLength, __accept_h);


    // @@ if no accept
    if ( !acceptLength ) {

        // console.log('hitter');
        newReqHeader['allow_passage'] = false;
        return newReqHeader
    }

    // return
    // console.log('_h -->', _h);

    // let uAllowedDomain = uAllowedDomain.indexOf(':') > -1 ? uAllowedDomain.split('://')[1].split(':').join('__') : uAllowedDomain;

    // @@ -- extract content type
    contType = utils.evf(__accept_h, 'H61~%%', '%&7&');

    // console.log('contType req proce -->', _h );

    contType = contType == 'a/j' ? 'application/json' : contType;
    contType = contType == 'm/f' ? 'multipart/form-data' : contType;

    // @@ -- extract method
    newReqHeader['content-type'] = contType;

    // @@ -- extract method
    // newReqHeader['method'] = evf(__accept_h, '00_l%%', '=+8%$jhfAQr61');
    newReqHeader['ops'] = utils.evf(__accept_h, '00_l%%', '=+8%$jhfAQr61');

    newReqHeader['ops'] = utils.ops_map[newReqHeader['ops']] || 'null';

    // console.log('newReqHeader ops ==->', newReqHeader['ops']);

    // @@ -- extract cookies
    newReqHeader['cookie'] = typeof _h.get('cookie') !== 'undefined' ? _h.get('cookie') : '';

    // console.log(
    //     'config.allowedOrigins --====-->>>>', 
    //     config.allowedOrigins,  
    //     config.allowedOrigins.indexOf( req.headers.get('origin') ) > -1, '\n ---> _h', _h, '\n',
    //     '__accept_h', ' :: ->', __accept_h, __accept_h.indexOf(config.allowedOriginLocal) > -1 );

    // allowedOriginApp
    // console.log('config.allowedOrigins --====-->>>>', __accept_h, config.allowedOriginApp, req.headers.get('origin') );

    // @@ if it's a local req
    if (

        ( !req.headers.get('origin') && __accept_h.indexOf(config.allowedOriginApp) > -1) ||
        ( (req.headers.get('origin') ) && __accept_h.indexOf(config.allowedOriginLocal) > -1) ||
        __accept_h.indexOf(config.allowedOriginLocal) > -1 ||
        (config.allowedOrigins && config.allowedOrigins.indexOf( req.headers.get('origin') ) > -1)
    
    ) {

        newReqHeader['allow_passage'] = true;

    }

    contType = null;


    return newReqHeader
};


// @@ getPayload 
utils.getPayload = async (req, newReqHeader) => {


    // if ( !req.headers.accept ) { return }

    let payLoadData, parseForm;
    // console.log('getPayloader!', 'contType', req.headers['content-type']);
    // console.log('getPayloader!', 'contType', newReqHeader );

    // if (!contType) { return { payLoadData: { __k: 'null'}  } }

    if (newReqHeader['content-type'] && newReqHeader['content-type'] === 'application/json') {

        // console.log('getPayload yay!!'); 

        let dataHold = [];
        // useJson = true; 
        parseForm = () => {
            return new Promise(async resolve => {
                // req.on('data', (chunks) => {
                //     dataHold.push(chunks);
                // })
                //     .on('end', () => {

                //         // console.log('end');
                //         let reqData = dataHold;
                //         reqData = Buffer.concat(reqData).toString();
                //         payLoadData = reqData === '' ? {} : JSON.parse(reqData);
                //         resolve(payLoadData);

                //     });
                payLoadData = await req.json();
                resolve(payLoadData);
            });
        }

    }

    // else if (newReqHeader['content-type'] && newReqHeader['content-type'].indexOf('multipart/form-data') > -1) {

    //     // console.log('Costa motors BackendHelper --> get payLoadData form data detected'); 
    //     useJson = false;
    //     const form = formidable({ multiples: true });
    //     parseForm = () => {
    //         return new Promise(resolve => {
    //             form.parse(req, async (err, fields, files) => {
    //                 if (err) {
    //                     resolve({ files: { '': '' }, body: {} });
    //                     console.log(err);
    //                 } else {
    //                     resolve({ files, body: fields });
    //                 }
    //             })
    //         })

    //     };

    // }

    else {

        parseForm = () => {
            // Might not be necessary here but who knows   
            // useJson = false; 
            payLoadData = false;

            return 'null-data'
        }


    }

    let _payLoadData = await parseForm();

    // console.log('payLoadData ==>', payLoadData);

    return _payLoadData;

};

const eng_let_nums = { 

	'a': 8, 
	'b': 11, 
	'c': 17, 
	'd': 13, 
	'e': 1, 
	'f': 25, 
	'g': 16, 
	'h': 14, 
	'i': 3, 
	'j': 12, 
	'k': 26, 
	'l': 29, 
	'm': 4, 
	'n': 24, 
	'o': 22, 
	'p': 7, 
	'q': 23, 
	'r': 18, 
	's': 28, 
	't': 27, 
	'u': 21, 
	'v': 5, 
	'w': 9, 
	'x': 15, 
	'y': 6, 
	'z': 2, 

	'0': 30,
	'1': 31,
	'2': 32,
	'3': 33,
	'4': 34,
	'5': 35,
	'6': 36,
	'7': 37,
	'8': 38,
	'9': 39,
	'_': 19, 
	'.': 10,

}; 

// @@ generate_uid from Username
utils.generate_uid = function (string_one) {

    // rules = typeof rules == 'string' ? [rules] : rules;
    // let concatedDataFromkeys = [];

    // Auther.encoder
    // rules.forEach(k => {
    //     // console.log('dataToProcess -->', dataToProcess[k], k );
    //     dataToProcess[k] && concatedDataFromkeys.push(dataToProcess[k]);
    // });

    // console.log('concatedDataFromkeys -->:', rules, dataToProcess, concatedDataFromkeys);

    const randNums = [12, 18, 9, 6, 2, 45, 33, 10, 6, 18, 42, 25, 21];
    const randBigNums = [16895, 90878, 25543, 595422, 33456, 453310, 23242, 3321];
    let randOne = randNums[Math.floor(Math.random() * randNums.length)];
    let _now = "" + (Date.now() * randOne * (randBigNums[Math.floor(Math.random() * randBigNums.length)]) * 56);
    _now = _now.replace(/\./g, '');

    // _now = _now.replace('.', '');
    string_one = string_one.trim();

    let dataKeyToArray = string_one.split('');
    let l = dataKeyToArray.length, fs = '';

    dataKeyToArray.forEach((s, i) => {

        if (i <= l) {
            fs += s + ( _now[i] || randNums[Math.floor( Math.random() * randNums.length)] );
        }
        else {
            // fs += _now.slice(l);
        }

    });

    fs += _now.slice(l);

    fs = fs.replace(/undefined/g, '');
    fs = fs.replace('+', '');
    fs = fs.replace('000', (""+Date.now()).slice(-1, 6))

    // console.log('uid fs -->', fs, dataKeyToArray );


    // console.log('_now mod ==>', _now, _now.slice(l), fs );
    // dataToProcess['_uid'] = fs;

    // @@ process __creator once and for all
    // if (dataToProcess['__creator_'] && (dataToProcess['__creator_'] == 'null' || dataToProcess['__creator_'] == 'System_' || dataToProcess['__creator_'] == '$System$' )) {
        // dataToProcess['__creator_'] = fs;
    // }

    // generate_uid
    return fs
};