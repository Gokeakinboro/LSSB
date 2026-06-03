

export const _u = {};

// @@ evf
_u.evf = (i, n, f) => {
    let e = i.indexOf(n),
        r = i.indexOf(f, e);
    if (-1 != e && -1 != r && r >= e) return i.substring(e, r).split(n).join("");
};

_u.ewf = (str, st, en) => {
    var sti = str.indexOf(st);
    var eni = str.indexOf(en, sti);
    if (sti != -1 && eni != -1 && eni >= sti)
        return str.substring(sti, eni) + en
};


// @@ some helpers
_u.alpha_s = [
    'a', 'b', 'c', 'd', 'e', 'f',
    'g', 'h', 'i', 'j', 'k', 'l',
    'm', 'n', 'o', 'p', 'q', 'r',
    's', 't', 'u', 'v', 'w', 'x',
    'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F',
    'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'Q', 'R',
    'S', 'T', 'U', 'V', 'W', 'X',
    'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
];

_u.rand_num_btw_1_and = function (num) {
    return Math.floor((Math.random() * num) + 1);
};

_u.rand_num_btw = function (num1, num2) {

    let rand = Math.floor((Math.random() * num2) + 1);
    // @@ ensure rand number is greater than num1  
    return rand <= num1 ? num1 + 1 : num1;

};

_u.gen_id = function () {


    let id_ = '', l, now_ = "" + Date.now();
    // now_ = now_.substring(0, 10);
    now_ = now_.slice(-10, -1);

    console.log('now_ ===---===<>>>>', now_);
    // now_
    now_ = now_.split('');

    l = now_.length;
    for (let i = 0; i < l; i++) {
        // A a random letter plus rand number 
        id_ += _u.alpha_s[_u.rand_num_btw_1_and(59) - 1] + now_[i];

        // @@ remove replace V with v
        id_ = id_.replace(/V/g, 'v');
    }

    return id_
};


// @@ add preceeding zeros to a number
_u.preceeder_ = function (start_index, num_of_digits) {

    num_of_digits = num_of_digits || 6;
    start_index = start_index || 1;
    start_index = "" + start_index; // @@ cast  to string

    let add_ = '';
    let deficit = num_of_digits - start_index.length;

    for (let i = 0; i < deficit; i++) {
        add_ += '0';
    }

    start_index = add_ + start_index;
    // console.log('1', nu_, nu_.length, deficit, add_);
    return start_index

}


_u.data_v_to_check_with = function (key, data) {
    let a;
    if (key.indexOf('.') > -1) {

        // console.log('key dot', key);
        a = key.split('.');
        let o = typeof data[a[0].trim()] !== 'undefined' ? data[a[0].trim()] : {};
        return o[a[1].trim()]
    }

    // console.log('data[key]', key, data, data[key] );

    return data[key] || 'NILL'
}


_u.sorter = function (data, key, desc) {

    let f = data.sort(function (a, b) {

        a[key] = typeof a[key] == 'string' ? a[key].toLowerCase(): a[key];
        b[key] = typeof b[key] == 'string' ?  b[key].toLowerCase() : b[key];

        if (a[key] < b[key]) {
            return -1;
        }
        if (a[key] > b[key]) {
            return 1;
        }
        return 0;
    });

    if (desc) { return f.reverse() }
    return f
}

_u.which_doc_key_to_set = function (key, data, value) {

    let a = [], ops = '', ops_helper = {}, update_value = '';

    // console.log('---> key dot', key, '---- 000 value ::: --->', value, "value['$add']" );

    if (key.indexOf('.') > -1) {

        // console.log('---> key dot', key);
        a = key.split('.');

        // console.log('---> key dot', a.length, a );
        // @@ process adder
        // if (a[0].trim() == '$add') {
        if (value[key]['$add']) {

            // a.shift();
            ops = '$add';

            // key = '';
            update_value = value[key].$add;
            // if (value['$push2_max$']) {

            // console.log(' hyuiyghn ---> key dot', a.length, a );

            // console.log('----- ::: ------00 +++ ---- >>>>>>> update_value', update_value, value );

            // ops_helper = { 'push2_max': value['$push2_max$'] }
            delete value['$add'];
            // }

            // console.log('---> time to ADDDD --======<>>>>>', a , ops );
        }

        if (a[0].trim() == '$add_string') {

            a.shift();
            ops = '$add_string';

            // console.log('---> time to ADDDD --======<>>>>>', a , ops );

        }

        if (a[0].trim() == '$remove_string') {

            a.shift();
            ops = '$remove_string';

            // console.log('---> time to ADDDD --======<>>>>>', a , ops );

        }

        if (a[0].trim() == '$push') {

            a.shift();
            ops = '$push';
            if (value['$push_max$']) {

                ops_helper = { 'push_max': value['$push_max$'] }
                delete value['$push_max$'];
            }
            // console.log('---> time to Push new value --======<>>>>>', value);
        }

        if (a[0].trim() == '$push2') {

            a.shift();
            ops = '$push2';
            if (value['$push2_max$']) {

                ops_helper = { 'push2_max': value['$push2_max$'] }
                delete value['$push2_max$'];
            }
            // console.log('---> time to Push new value --======<>>>>>', value );
        }

        if (a[0].trim() == '$unpush') {

            a.shift();
            ops = '$unpush';
            // console.log('---> time to ADDDD --======<>>>>>', a , ops );
        }

        if (a.length == 4) {

            data[a[0]] = data[a[0]] || {};

            data[a[0]][a[1].trim()] = typeof data[a[0]][a[1].trim()] == 'object' && typeof data[a[0]][a[1].trim()] !== 'undefined' ? data[a[0]][a[1].trim()] : {};

            data[a[0]][a[1].trim()][a[2].trim()] = typeof data[a[0]][a[1].trim()][a[2].trim()] == 'object' && typeof data[a[0]][a[1].trim()][a[2].trim()] !== 'undefined' ? data[a[0]][a[1].trim()][a[2].trim()] : {};

            if (ops == '$add') {

                data[a[0]][a[1].trim()][a[2].trim()][a[3].trim()] = typeof data[a[0]][a[1].trim()][a[2].trim()][a[3].trim()] !== 'number' ? 0 : data[a[0]][a[1].trim()][a[2].trim()][a[3].trim()];
                data[a[0]][a[1].trim()][a[2].trim()][a[3].trim()] += update_value;
            }

            else if (ops == '$add_string') {

                data[a[0]][a[1].trim()][a[2].trim()][a[3].trim()] = data[a[0]][a[1].trim()][a[2].trim()][a[3].trim()] || '';

                if (data[a[0]][a[1].trim()][a[2].trim()][a[3].trim()].indexOf(value[key]) == -1) {
                    data[a[0]][a[1].trim()][a[2].trim()][a[3].trim()] += value[key] + '~~';
                }

            }

            else if (ops == '$remove_string') {

                data[a[0]][a[1].trim()][a[2].trim()][a[3].trim()] = data[a[0]][a[1].trim()][a[2].trim()][a[3].trim()] || '';
                data[a[0]][a[1].trim()][a[2].trim()][a[3].trim()] = data[a[0]][a[1].trim()][a[2].trim()][a[3].trim()].replace(value[key], '');
            }

            else if (ops == '$push') {

                if (typeof data[a[0]][a[1].trim()][a[2].trim()][a[3].trim()] == 'object' && typeof data[a[0]][a[1].trim()][a[2].trim()][a[3].trim()].length == 'number' && data[a[0]][a[1].trim()][a[2].trim()][a[3].trim()].indexOf(value[key]) == -1) {
                    data[a[0]][a[1].trim()][a[2].trim()][a[3].trim()].unshift(value[key]);

                    if (typeof ops_helper.push_max == 'number' && data[a[0]][a[1].trim()][a[2].trim()][a[3].trim()].length > ops_helper.push_max) {
                        data[a[0]][a[1].trim()][a[2].trim()][a[3].trim()].pop()
                    }
                }

            }

            else if (ops == '$push2') {

                if (typeof data[a[0]][a[1].trim()][a[2].trim()][a[3].trim()] == 'object' && typeof data[a[0]][a[1].trim()][a[2].trim()][a[3].trim()].length == 'number' && data[a[0]][a[1].trim()][a[2].trim()][a[3].trim()].indexOf(value[key]) == -1) {
                    data[a[0]][a[1].trim()][a[2].trim()][a[3].trim()].unshift(value[key]);

                    if (typeof ops_helper.push2_max == 'number' && data[a[0]][a[1].trim()][a[2].trim()][a[3].trim()].length > ops_helper.push2_max) {
                        data[a[0]][a[1].trim()][a[2].trim()][a[3].trim()].pop()
                    }
                }

            }

            else if (ops == '$unpush') {

                if (typeof data[a[0]][a[1].trim()][a[2].trim()][a[3].trim()] == 'object' && typeof data[a[0]][a[1].trim()][a[2].trim()][a[3].trim()].length == 'number' && data[a[0]][a[1].trim()][a[2].trim()][a[3].trim()].indexOf(value[key]) > -1) {
                    let ai_ = data[a[0]][a[1].trim()][a[2].trim()][a[3].trim()].indexOf(value[key]);
                    data[a[0]][a[1].trim()][a[2].trim()][a[3].trim()][ai_] = ''; ai_ = null;
                }

            }

            else {
                data[a[0]][a[1].trim()][a[2].trim()][a[3].trim()] = value[key];
            }


            // console.log('---> key dot', a.length, data[a[0]] );

        }

        else if (a.length == 3) {

            data[a[0]] = data[a[0]] || {};

            data[a[0]][a[1].trim()] = typeof data[a[0]][a[1].trim()] == 'object' && typeof data[a[0]][a[1].trim()] !== 'undefined' ? data[a[0]][a[1].trim()] : {};

            if (ops == '$add') {

                data[a[0]][a[1].trim()][a[2].trim()] = typeof data[a[0]][a[1].trim()][a[2].trim()] !== 'number' ? 0 : data[a[0]][a[1].trim()][a[2].trim()];
                data[a[0]][a[1].trim()][a[2].trim()] += update_value;
            }

            else if (ops == '$add_string') {

                data[a[0]][a[1].trim()][a[2].trim()][a[3].trim()] = data[a[0]][a[1].trim()][a[2].trim()] || '';

                if (data[a[0]][a[1].trim()][a[2].trim()].indexOf(value[key]) == -1) {
                    data[a[0]][a[1].trim()][a[2].trim()] += value[key] + '~~';
                }

            }

            else if (ops == '$remove_string') {

                data[a[0]][a[1].trim()][a[2].trim()] = data[a[0]][a[1].trim()][a[2].trim()] || '';
                data[a[0]][a[1].trim()][a[2].trim()] = data[a[0]][a[1].trim()][a[2].trim()].replace(value[key], '');
            }

            else if (ops == '$push') {

                if (typeof data[a[0]][a[1].trim()][a[2].trim()] == 'object' && typeof data[a[0]][a[1].trim()][a[2].trim()].length == 'number' && data[a[0]][a[1][a[2].trim()].trim()].indexOf(value[key]) == -1) {
                    data[a[0]][a[1].trim()][a[2].trim()].unshift(value[key]);

                    if (typeof ops_helper.push_max == 'number' && data[a[0]][a[1].trim()][a[2].trim()].length > ops_helper.push_max) {
                        data[a[0]][a[1].trim()][a[2].trim()].pop()
                    }
                }

            }

            else if (ops == '$push2') {

                if (typeof data[a[0]][a[1].trim()][a[2].trim()] == 'object' && typeof data[a[0]][a[1].trim()][a[2].trim()].length == 'number' && data[a[0]][a[1][a[2].trim()].trim()].indexOf(value[key]) == -1) {
                    data[a[0]][a[1].trim()][a[2].trim()].unshift(value[key]);

                    if (typeof ops_helper.push2_max == 'number' && data[a[0]][a[1].trim()][a[2].trim()].length > ops_helper.push2_max) {
                        data[a[0]][a[1].trim()][a[2].trim()].pop()
                    }
                }

            }

            else if (ops == '$unpush') {

                if (typeof data[a[0]][a[1].trim()][a[2].trim()] == 'object' && typeof data[a[0]][a[1].trim()][a[2].trim()].length == 'number' && data[a[0]][a[1][a[2].trim()].trim()].indexOf(value[key]) > -1) {
                    let ai_ = data[a[0]][a[1].trim()][a[2].trim()].indexOf(value[key]);
                    data[a[0]][a[1].trim()][a[2].trim()][ai_] = ''; ai_ = null;
                }

            }

            else {
                data[a[0]][a[1].trim()][a[2].trim()] = value[key];
            }


            // console.log('---> key dot', a, value[key] );

        }

        else if (a.length == 2) {
            // let o = 
            // console.log('---> key dot 2', a, key);

            data[a[0]] = typeof data[a[0]] == 'object' && typeof data[a[0]] !== 'undefined' ? data[a[0]] : {};

            // console.log('---> key dot 222', a, key, data[a[0]], value, ops);



            if (ops == '$add') {

                // console.log('we are about to $adddddd ---> ', data[a[0]][a[1].trim()], update_value );

                data[a[0]][a[1].trim()] = data[a[0]][a[1].trim()] || 0;

                data[a[0]][a[1].trim()] = typeof data[a[0]][a[1].trim()] !== 'number' ? 0 : data[a[0]][a[1].trim()]

                data[a[0]][a[1].trim()] += update_value;


                // console.log('after --- we are about to $adddddd ---> ', data[a[0]][a[1].trim()], value[key] );


            }

            else if (ops == '$add_string') {

                // console.log('we are about to $adddddd_string AA ---> ', data[a[0]][a[1].trim()], value[key] );

                data[a[0]][a[1].trim()] = data[a[0]][a[1].trim()] || '';

                if (data[a[0]][a[1].trim()].indexOf(value[key]) == -1) {
                    data[a[0]][a[1].trim()] += value[key] + '~~';
                }

            }

            else if (ops == '$remove_string') {

                data[a[0]][a[1].trim()] = data[a[0]][a[1].trim()] || '';
                data[a[0]][a[1].trim()] = data[a[0]][a[1].trim()].replace(value[key], '');
            }

            else if (ops == '$push') {

                if (typeof data[a[0]][a[1].trim()] == 'object' && typeof data[a[0]][a[1].trim()].length == 'number' && data[a[0]][a[1].trim()].indexOf(value[key]) == -1) {
                    data[a[0]][a[1].trim()].unshift(value[key]);

                    if (typeof ops_helper.push_max == 'number' && data[a[0]][a[1].trim()].length > ops_helper.push_max) {
                        data[a[0]][a[1].trim()].pop()
                    }
                }

            }

            else if (ops == '$push2') {

                if (typeof data[a[0]][a[1].trim()] == 'object' && typeof data[a[0]][a[1].trim()].length == 'number' && data[a[0]][a[1].trim()].indexOf(value[key]) == -1) {
                    data[a[0]][a[1].trim()].unshift(value[key]);

                    if (typeof ops_helper.push2_max == 'number' && data[a[0]][a[1].trim()].length > ops_helper.push2_max) {
                        data[a[0]][a[1].trim()].pop()
                    }
                }

            }

            else if (ops == '$unpush') {

                if (typeof data[a[0]][a[1].trim()] == 'object' && typeof data[a[0]][a[1].trim()].length == 'number' && data[a[0]][a[1].trim()].indexOf(value[key]) > -1) {
                    let ai_ = data[a[0]][a[1].trim()].indexOf(value[key]);
                    data[a[0]][a[1].trim()][ai_] = ''; ai_ = null;
                }

            }

            else {
                data[a[0]][a[1].trim()] = value[key];
            }


            // if (typeof data[a[0].trim()] !== 'undefined' ? data[a[0].trim()] : {};
            // return o[a[1].trim()]
        }

        else {
            // let o = 
            // console.log('---> key dot 2', a, key);

            // data[a[0]] = typeof data[a[0]] == 'object' && typeof data[a[0]] !== 'undefined' ? data[a[0]] : {};
            // data[a[0]] = typeof data[a[0]] == 'object' && typeof data[a[0]] !== 'undefined' ? data[a[0]] : {};/

            // console.log('---> key dot 222 ---ko87ijk ', a, key, data[a[0]], value );

            if (ops == '$add') {

                data[a[0]] = data[a[0]] || 0;
                data[a[0]] = typeof data[a[0]] !== 'number' ? 0 : data[a[0]];
                data[a[0]] += update_value;

            }

            else if (ops == '$add_string') {

                console.log('we are about to $adddddd_string BB ---> ', data, value[key]);

                data[a[0]] = data[a[0]] || '';

                if (data[a[0]].indexOf(value[key]) == -1) {
                    data[a[0]] += value[key] + '~~';
                }

            }

            else if (ops == '$remove_string') {

                data[a[0]] = data[a[0]] || '';
                data[a[0]] = data[a[0]].replace(value[key], '');
            }

            else if (ops == '$push') {

                if (typeof data[a[0]] == 'object' && typeof data[a[0]].length == 'number' && data[a[0]].indexOf(value[key]) == -1) {
                    data[a[0]].unshift(value[key]);

                    if (typeof ops_helper.push_max == 'number' && data[a[0]].length > ops_helper.push_max) {
                        data[a[0]].pop()
                    }
                }

            }

            else if (ops == '$push2') {

                if (typeof data[a[0]] == 'object' && typeof data[a[0]].length == 'number' && data[a[0]].indexOf(value[key]) == -1) {
                    data[a[0]].unshift(value[key]);

                    if (typeof ops_helper.push2_max == 'number' && data[a[0]].length > ops_helper.push2_max) {
                        data[a[0]].pop()
                    }
                }

            }

            else if (ops == '$unpush') {

                if (typeof data[a[0]] == 'object' && typeof data[a[0]].length == 'number' && data[a[0]].indexOf(value[key]) > -1) {
                    let ai_ = data[a[0]].indexOf(value[key]);
                    data[a[0]][ai_] = ''; ai_ = null;
                }

            }

            else {
                data[a[0]] = value[key];
            }


            // if (typeof data[a[0].trim()] !== 'undefined' ? data[a[0].trim()] : {};
            // return o[a[1].trim()]
        }



        // console.log('---> data[a[0]]', data[a[0]], value );

    }

    else {

        let final_value = typeof value[key] !== 'undefined' ? value[key] : value;
        ops = key;

        if (ops == '$add') {

            data[key] = typeof data[key] !== 'number' ? 0 : data[key];
            data[key] += final_value;
        }

        else if (ops == '$add_string') {

            console.log('we are about to $adddddd_string CC ---> ', data[key], final_value);

            data[key] = data[key] || '';

            if (data[key].indexOf(final_value) == -1) {
                data[key] += final_value + '~~';
            }

        }

        else if (ops == '$remove_string') {

            data[key] = data[key] || '';
            data[key] = data[key].replace(final_value, '');
        }

        else if (ops == '$push') {


           let kk = Object.keys(value[key])[0];

        //    console.log('kk ------------>', kk, '\n value[key] -->', value[key] )

            data[kk] = typeof data[kk] == 'object' && typeof data[kk].length == 'number' ? data[kk] : [];

            final_value = value['$push'][kk];

            if ( data[kk].indexOf(final_value) == -1) {
                
                data[kk].unshift(final_value);

                // if (typeof ops_helper.push_max == 'number' && data[key].length > ops_helper.push_max) {
                //     data[key].pop()
                // }

                if (typeof value.$push_max$ == 'number' && data[kk].length > value.$push_max$) {
                    data[kk].pop();

                }
            }

        }

        else if (ops == '$push2') {

            if (typeof data[key] == 'object' && typeof data[key].length == 'number' && data[key].indexOf(final_value) == -1) {
                data[key].unshift(final_value);

                if (typeof ops_helper.push2_max == 'number' && data[key].length > ops_helper.push2_max) {
                    data[key].pop()
                }
            }

        }

        else if (ops == '$unpush') {

            if (typeof data[key] == 'object' && typeof data[key].length == 'number' && data[key].indexOf(final_value) > -1) {
                let ai_ = data[key].indexOf(final_value);
                data[key][ai_] = ''; ai_ = null;
            }

        }

        else {

            if ( key !== '$push_max$') {
            data[key] = final_value;
            }
        }

    }

    // data[key] || 'NILL'
    return data;
}

