
export const value_from_key_depth = function (key, data) {
    let a;
    if (key.indexOf('.') > -1) {

        // console.log('key dot', key);
        a = key.split('.');
        a = a.map(ei => ei.trim());

        // $null means key value doesn't exist... no need to proceed with check
        // --- 
        if (typeof data[a[0]] == 'undefined') { return '$null' }

        // @@ for 2 e.g _fields._sex
        if (a.length == 2) {

            if (typeof data[a[0]][a[1]] == 'undefined') { return '$null' }
            return data[a[0]][a[1]]

        }

        if (a.length == 3) {

            if (typeof data[a[0]][a[1]] == 'undefined') { return '$null' }
            if (typeof data[a[0]][a[1]][a[2]] == 'undefined') { return '$null' }

            return data[a[0]][a[1]][a[2]]

        }


        // ['_fields.academics.school.course'] = ['_fields', 'academics', 'school', 'course']
        if (a.length == 4) {


            if (typeof data[a[0]][a[1]] == 'undefined') { return '$null' }
            if (typeof data[a[0]][a[1]][a[2]] == 'undefined') { return '$null' }
            if (typeof data[a[0]][a[1]][a[2]][a[3]] == 'undefined') { return '$null' }

            return data[a[0]][a[1]][a[2]][a[3]]

        }

        if (a.length == 5) {


            if (typeof data[a[0]][a[1]] == 'undefined') { return '$null' }
            if (typeof data[a[0]][a[1]][a[2]] == 'undefined') { return '$null' }
            if (typeof data[a[0]][a[1]][a[2]][a[3]] == 'undefined') { return '$null' }
            if (typeof data[a[0]][a[1]][a[2]][a[3]][a[4]] == 'undefined') { return '$null' }

            return data[a[0]][a[1]][a[2]][a[3]][a[4]]

        }


    }

    // console.log('data[key]', key, data, data[key] );

    return data[key] || "$null"
}

