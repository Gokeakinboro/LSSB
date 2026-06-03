

export const date_ranger = function ($date_range) {

    if ($date_range.length == 1) {

        let _d = new Date();
        _d = _d.toISOString();
        // 2024-07-27
        $date_range[1] = _d.slice(0, 10);
    }

    let v_ = {
        rangeStart: $date_range[0].split('-'),
        rangeEnd: $date_range[1].split('-'),
        minYear: 2023,
        maxYear: 2030,
    };

    if (v_.rangeStart.length !== 3 && v_.rangeEnd.length !== 3) {
        return 'Invalid date range'
    }

    v_.rangeStart = v_.rangeStart.map(e => parseInt(e));
    v_.rangeEnd = v_.rangeEnd.map(e => parseInt(e));

    v_.startYear = v_.rangeStart[0];
    v_.startMonth = v_.rangeStart[1];
    v_.startDay = v_.rangeStart[2];

    v_.endYear = v_.rangeEnd[0];
    v_.endMonth = v_.rangeEnd[1];
    v_.endDay = v_.rangeEnd[2];

    v_.startExclusion = [];
    v_.endExclusion = [];

    for (let index = 1; index <= v_.startMonth; index++) {

        // for (let ind = 1; ind < v_.startDay; ind++) {
        for (let ind = 1; ind <= 31; ind++) {

            if (index == v_.startMonth ) {

                if ( ind < v_.startDay ) {

                    v_.startExclusion.push(`${v_.startYear}-${("" + index).length == 1 ? "0" + index : "" + index}-${("" + ind).length == 1 ? "0" + ind : "" + ind}`);
                }

                // let f = `${v_.startYear}-${("" + index).length == 1 ? "0" + index : "" + index}-${("" + ind).length == 1 ? "0" + ind : "" + ind}`;

                // v_.startExclusion.push(f);
                // console.log('ini -->', index, ind, v_.startDay);
            }

            else {
                v_.startExclusion.push(`${v_.startYear}-${("" + index).length == 1 ? "0" + index : "" + index}-${("" + ind).length == 1 ? "0" + ind : "" + ind}`);
            }
        }

    }

    // for (let index = 1; index < v_.endMonth; index++) {
    //     v_.endExclusion.push(`${v_.endYear}-${("" + index).length == 1 ? "0" + index : "" + index}`);
    // }

    for (let index = v_.endMonth; index <= 12; index++) {

        // for (let ind = 1; ind < v_.startDay; ind++) {
        for (let ind = 1; ind <= 31; ind++) {

            if (index == v_.endMonth ) {


                if ( ind > v_.endDay ) {

                    v_.endExclusion.push(`${v_.endYear}-${("" + index).length == 1 ? "0" + index : "" + index}-${("" + ind).length == 1 ? "0" + ind : "" + ind}`);

                }

                // let f = `${v_.startYear}-${("" + index).length == 1 ? "0" + index : "" + index}-${("" + ind).length == 1 ? "0" + ind : "" + ind}`;
                // v_.startExclusion.push(f);
                // console.log('ini -->', index, ind, v_.endDay);
                // v_.endExclusion.push(`${v_.endYear}-${("" + index).length == 1 ? "0" + index : "" + index}-${("" + ind).length == 1 ? "0" + ind : "" + ind}`);
            }

            else {
                v_.endExclusion.push(`${v_.endYear}-${("" + index).length == 1 ? "0" + index : "" + index}-${("" + ind).length == 1 ? "0" + ind : "" + ind}`);
            }
        // v_.endExclusion.push(`${v_.endYear}-${("" + index).length == 1 ? "0" + index : "" + index}-`);
        }

        

    }

    // for (let index = 1; index > v_.endMonth; index++) {
    //     v_.startExclusion.push(`${v_.endYear}-${(""+index).length == 1 ? "0"+index: ""+index}`);
    // }

    // for (let index = 1; index < v_.startMonth; index++) {
    //     v_.endExclusion.push(`${v_.startYear}-${(""+index).length == 1 ? "0"+index: ""+index}`);
    // }

    if (v_.startYear > v_.endYear) {
        return { error: 'Start Year should be less than end year' }
    }

    if (v_.startYear < v_.minYear || v_.startYear > v_.maxYear) {
        return { error: 'Start Year should be between 2023 - 2030' }
    }

    if (v_.endYear < v_.minYear || v_.endYear > v_.maxYear) {
        return { error: 'End Year should be between 2023 - 2030' }
    }

    if (v_.startMonth < 1 || v_.startMonth > 12) {
        return { error: 'Start Month should be between 01 - 12' }
    }

    if (v_.endMonth < 1 || v_.endMonth > 12) {
        return { error: 'End Month should be between 01 - 12' }
    }

    if (v_.startDay < 1 || v_.startDay > 31) {
        return { error: 'Start Day should be between 01 - 31' }
    }

    if (v_.endDay < 1 || v_.endDay > 31) {
        return { error: 'End Day should be between 01 - 31' }
    }

    // @@ -- Ranger Algo
    // -- 
    let year_combo = [];

    for (let indexYear = v_.startYear; indexYear <= v_.endYear; indexYear++) {

        // const element = array[indexYear];
        indexYear = ("" + indexYear);
        year_combo.push(indexYear);

    }


    let month_combo = [];

    for (let indexMo = v_.startMonth; indexMo <= 12; indexMo++) {

        // const element = array[indexYear];
        // console.log('""+indexMo.length -->', ""+indexMo )
        indexMo = ("" + indexMo).length == 1 ? "0" + indexMo : "" + indexMo;
        month_combo.push(indexMo);

    }

    for (let indexYear = 1; indexYear <= v_.endMonth; indexYear++) {

        // const element = array[indexYear];
        indexYear = ("" + indexYear).length == 1 ? "0" + indexYear : ("" + indexYear);
        month_combo.indexOf(indexYear) == -1 && month_combo.push(indexYear);
    }

    let day_combo = [];

    for (let indexYear = v_.startDay; indexYear <= 31; indexYear++) {

        // const element = array[indexYear];
        indexYear = ("" + indexYear).length == 1 ? "0" + indexYear : ("" + indexYear);
        day_combo.push(indexYear);

    }

    for (let indexYear = 1; indexYear <= v_.endDay; indexYear++) {

        // const element = array[indexYear];
        indexYear = ("" + indexYear).length == 1 ? "0" + indexYear : ("" + indexYear);
        day_combo.indexOf(indexYear) == -1 && day_combo.push(indexYear);

    }


    let date_str = '';
    for (let yeari = 0; yeari < year_combo.length; yeari++) {
        // const element = array[index];

        let year_c = year_combo[yeari];

        for (let monthi = 0; monthi < month_combo.length; monthi++) {

            // const element = array[index];
            let month_c = year_c + '-' + month_combo[monthi];

            // if (v_.startExclusion.indexOf(month_c) > -1 || v_.endExclusion.indexOf(month_c) > -1) {

            //     month_c = 'null';
            // }

            for (let dayi = 0; dayi < day_combo.length; dayi++) {

                // const element = array[index];
                // if (month_c !== 'null') {
                let fd = month_c + '-' + day_combo[dayi];
                if (v_.startExclusion.indexOf(fd) == -1 && v_.endExclusion.indexOf(fd) == -1) {
                
                    date_str +=  fd + ',';
                }

                // date_str = `${year_combo[yeari]}-${month_combo[monthi]}-${day_combo[dayi]}`+'--';

            }

        }

    }

    // let timer = setTimeout(function () {

    //     console.log(' running ranger 000 :: ---- -->', v_, year_combo, month_combo, day_combo);

    //     clearTimeout(timer);

    // }, 300);
    v_ = null;

    return { date_str }

    // console.log(' running ranger :: ---- -->',  v_, year_combo, month_combo, day_combo, date_str );


    // return $date_range.join('--');

}


// let timer = setTimeout(function() {

//     let startDate = Date.now();
//     let dd = "2024-07-15T11:17:43.287Z";
//     // dd = dd.slice(0, 10);
//     let res = run_ranger(['2023-04-10','2024-12-27']);
//     let checki = res.date_str.indexOf(dd.slice(0, 10)) > -1;
//     console.log(' data res ->', res, checki, 'in --->', (Date.now() - startDate ) / 1000 );

//     clearTimeout(timer);

// }, 300);