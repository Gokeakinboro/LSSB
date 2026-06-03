export const sorter = function (data, key, desc) {

    if (!data) { return [] }

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