const { _u } = await import('./_u.js');

// const _u = {};


// @@ check that a supplied value is not undefined
_u._nu = function (value) { return typeof value !== 'undefined' };

// @@ check that a supplied value is not undefined
_u._lowerCase = function (value) {
	return _u._nu(value) && typeof value == 'string' ? value.toLowerCase() : ''
};

const value_from_key_depth = function (key, data) {
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

export const filter_engine = function (data_, options, just_project) {

	if (!data_) {
		return { status: 'error', data: 'null' }
	}


	let data = data_;

	let has_where = _u._nu(options.$where);
	let has_where_not = _u._nu(options.$where_not);
	let has_search = _u._nu(options.$search);
	let has_includes = _u._nu(options.$includes);

	let has_date = options.$date_ranger && options.$date_ranger.allow;

	let has_projection = false, finalData = '';

	let num_checks = 0; // @@ number of checks based on supplied options
	let final_status = 'false'; // @@ track final status of all checks
	let _success_count = 0; // @@ _success_count --> track how many of clauses passed

    
	// console.log(' has_where 0 -->', options.$where );

	// @@ start with where clauses ================/
	if (has_where) {

		num_checks++;

		//@@ get the number of _where checks supplied
		let where_clause = Object.keys(options.$where), l = where_clause.length;
		let each_where_passed = 0; // @@ track each where passes...

		

		//  @@ if an empty  where-clause was  passed
		if (where_clause.length < 1) { _success_count++ }

		// @@ process where_clause
		else {


			// @@ loop through where_clauses, for each where clause
			for (let i = 0; i < l; i++) {

				// console.log('supplied where keys ==>', where_clause[i], data[where_clause[i]], options.$where[where_clause[i]] );
				// let fromD = _u._lowerCase(_u.data_v_to_check_with(where_clause[i], data));
				// let fromOp = _u._lowerCase(options.$where[where_clause[i]]);

				let dataVal = value_from_key_depth(where_clause[i], data);

				if (dataVal !== '$null') {

					if (typeof dataVal == 'string') {

						dataVal = _u._lowerCase(dataVal);

						if (_u._lowerCase(dataVal) == _u._lowerCase(options.$where[where_clause[i]])) {

							each_where_passed++;
						}
					}

					else {
						if (dataVal == options.$where[where_clause[i]]) {
							each_where_passed++;
						}
					}

				}

				// console.log(  'pro keys 0 ==>', where_clause[i], fromD, fromOp );

				// @@ eun an exact match on key value pairs against data and supplied options
				// if (_u._nu(_u.data_v_to_check_with(where_clause[i], data))
				// 	&& fromD == fromOp) {
				// 	each_where_passed++;
				// }

			}

			// console.log('each_where_passed -->', each_where_passed );


			// @@ if all where conditions are met
			// @@ increment _success_count count
			if (each_where_passed == l) { _success_count++ }

		}


		// return
	}
	// END Where check ================/




	// @@ start with where not clauses ================/
	if (has_where_not) {

		num_checks++;

		//@@ get the number of _where checks supplied
		let where_not_clause = Object.keys(options.$where_not), l = where_not_clause.length;
		let each_where_not_passed = 0; // @@ track each where passes...

		// console.log(' finalData -->', finalData );

		//  @@ if an empty  where-clause was  passed
		if (where_not_clause.length < 1) { _success_count++ }

		// @@ process where_clause
		else {


			// @@ loop through where_clauses, for each where clause
			for (let i = 0; i < l; i++) {

				// console.log('supplied where keys ==>', where_clause[i], data[where_clause[i]], options.$where[where_clause[i]] );
				// let fromD = _u._lowerCase(_u.data_v_to_check_with(where_clause[i], data));
				// let fromOp = _u._lowerCase(options.$where[where_clause[i]]);

				let dataVal = value_from_key_depth(where_not_clause[i], data);

				if (dataVal !== '$null') {

					if (typeof dataVal == 'string') {

						dataVal = _u._lowerCase(dataVal);

						// console.log('not not :: ->', _u._lowerCase(dataVal), 'K : ', _u._lowerCase(options.$where_not[where_not_clause[i]]), 'clause: ', where_not_clause[i] );

						if (_u._lowerCase(dataVal) !== _u._lowerCase(options.$where_not[where_not_clause[i]])) {

							each_where_not_passed++;
						}
					}

					else {
						if (dataVal !== options.$where_not[where_not_clause[i]]) {
							each_where_not_passed++;
						}
					}

				}



			}

			// console.log('each_where_passed -->', each_where_passed );


			// @@ if all where conditions are met
			// @@ increment _success_count count
			if (each_where_not_passed == l) { _success_count++ }

		}


		// return
	}
	// END Where not check ================/



	// @@ start Search clauses ================/
	if (has_search) {

		// console.log();

		num_checks++;

		//@@ get the number of _where checks supplied
		let search_clause = Object.keys(options.$search), l = search_clause.length;
		// let each_search_passed = 0; // @@ track each where passes...

		// console.log(' finalData -->', finalData );

		//  @@ if an empty  where-clause was  passed
		if (search_clause.length < 1) { _success_count++ }

		// @@ process where_clause
		else {


			// @@ loop through where_clauses, for each where clause
			// for (let i = 0; i < l; i++) {

			// console.log('supplied where keys ==>', where_clause[i], data[where_clause[i]], options.$where[where_clause[i]] );
			// let fromD = _u._lowerCase(_u.data_v_to_check_with(where_clause[i], data));
			// let fromOp = _u._lowerCase(options.$where[where_clause[i]]);

			let dataVal = value_from_key_depth(search_clause[0], data);

			if (dataVal !== '$null') {



				dataVal = typeof dataVal == 'string' ? _u._lowerCase(dataVal) : dataVal;

				let q = _u._lowerCase(options.$search[search_clause[0]]);
				let qRex = new RegExp(`.*${q}.*`, "i");

				// console.log('qRex -->', qRex, q,  qRex.test(dataVal), search_clause );

				// @@ eun an exact match on key value pairs against data and supplied options
				if (qRex.test(dataVal)) {
					// each_search_passed++;
					_success_count++
				}

				// if (_u._lowerCase(dataVal) !== _u._lowerCase(options.$where[where_clause[i]])) {

				// 	each_search_passed++;
				// }


			}



			// }

			// console.log('each_where_passed -->', each_where_passed );


			// @@ if all where conditions are met
			// @@ increment _success_count count
			// if (each_search_passed == l) { _success_count++ }

		}


		// return
	}
	// END Search check ================/



	// @@ start Inlcudes clauses ================/
	if (has_includes) {

		num_checks++;

		//@@ get the number of _where checks supplied
		let includes_clause = Object.keys(options.$includes), l = includes_clause.length;
		let each_includes_passed = 0; // @@ track each where passes...

		// console.log(' finalData -->', finalData );

		//  @@ if an empty  where-clause was  passed
		if (includes_clause.length < 1) { _success_count++ }

		// @@ process where_clause
		else {


			// @@ loop through where_clauses, for each where clause
			for (let i = 0; i < l; i++) {

				// console.log('supplied where keys ==>', where_clause[i], data[where_clause[i]], options.$where[where_clause[i]] );
				// let fromD = _u._lowerCase(_u.data_v_to_check_with(where_clause[i], data));
				// let fromOp = _u._lowerCase(options.$where[where_clause[i]]);

				let dataVal = value_from_key_depth(includes_clause[i], data);

				if (dataVal !== '$null') {



					dataVal = typeof dataVal == 'string' ? _u._lowerCase(dataVal) : dataVal;

					// @@ the value of each  includes_clause has to be passed as an array
					// -- so we each supplied item has to paas (be present in "data")
					// -- don't supply a fail item

					// -- let's track the number of success of each item 
					let num_item_success = 0,
						item_success_count = options.$includes[includes_clause[i]].length;

					let isArray_or_String = typeof dataVal == 'string' || (typeof dataVal == 'object' && typeof dataVal.length == 'number');

					// options.$includes[includes_clause]
					options.$includes[includes_clause[i]].forEach(item => {

						if (_u._nu(data[includes_clause[i]]) && isArray_or_String && dataVal.indexOf(item) > -1) {
							// @@ record success if item exists in data's array
							num_item_success++;
						}
					});

					// @@ outside the loop --- if it's all success
					if (num_item_success == item_success_count) {

						// @@ this includes key check has passed
						// each_includes_passed++;
						_success_count++
					}

					// let q = _u._lowerCase(options.$search[v]);
					// let qRex = new RegExp(`.*${q}.*`, "i");

					// // console.log('qRex -->', qRex, v, data[v], qRex.test(data[v]) );

					// // @@ eun an exact match on key value pairs against data and supplied options
					// if (qRex.test(dataVal)) {
					// 	each_includes_passed++;
					// }

					// // if (_u._lowerCase(dataVal) !== _u._lowerCase(options.$where[where_clause[i]])) {

					// // 	each_includes_passed++;
					// // }


				}



			}

			// console.log('each_where_passed -->', each_where_passed );


			// @@ if all where conditions are met
			// @@ increment _success_count count
			// if (each_includes_passed == l) { _success_count++ }

		}


		// return
	}
	// END Inlcudes check ================/


	// @@ start Inlcudes clauses ================/
	if (has_date) {

		num_checks++;

		//@@ get the number of _where checks supplied
		let date_str = options.$date_ranger.range;
		//  l = date_clause.length;
		// let each_date_passed = 0; // @@ track each where passes...
		// let pass = false;

		// console.log(' date_clause -->', date_clause );

		//  @@ if an empty  where-clause was  passed
		// if (date_clause.length < 1) { pass = true; _success_count++ }



		let dataVal = data.$created_on$;

		// console.log('date_clause --->', 'date_clause', dataVal, options.$date_ranger );

		if (dataVal) {


			// dataVal = typeof dataVal == 'string' ? _u._lowerCase(dataVal) : dataVal;

			// @@ the value of each  includes_clause has to be passed as an array
			// -- so we each supplied item has to paas (be present in "data")
			// -- don't supply a fail item

			// -- let's track the number of success of each item 
			// let num_item_success = 0,
			// item_success_count = options.$includes[includes_clause[i]].length;

			// let isArray_or_String = typeof dataVal == 'string' || (typeof dataVal == 'object' && typeof dataVal.length == 'number');

			// options.$includes[includes_clause]
			// let date_matched = false;
			// date_clause.forEach( datex => {

			if (date_str.indexOf(dataVal.slice(0, 10)) > -1) {
				// @@ record success if item exists in data's array
				// date_matched = true;
				_success_count++;
			}
			// });




		}



		// }

		// console.log('each_where_passed -->', each_where_passed );


		// @@ if all where conditions are met
		// @@ increment _success_count count
		// if (each_includes_passed == l) { _success_count++ }

		// }


		// return
	}
	// END Inlcudes check ================/


	// @@ rest clause here




	// @@ when all checks have passed
	if (num_checks == _success_count) {
		final_status = 'true';
	}

	else {
		// @@ recast finalData to string if all checks don't pass
		finalData = 'null';
	}








	// @@ if final_status is true
	if (final_status == 'true') {

		// @@ runing projection 
		if (has_projection && options.$projection.length > 0) {


			// console.log('has proj', options.$projection);
			// options.return_creator_in_response && options.$projection.push('__creator__');

			options.$projection.forEach(p => {

				// if ( data.hasOwnProperty(p) ) {
				// 	finalData[p] = data[p];
				// }

				let pa = p.split('.');
				let k_to_use = pa.length > 1 ? pa[0][1] : pa[0];

				let _exists = pa.length > 1 ? data[pa[0]][pa[1]] : data[pa[0]];

				if (typeof _exists !== 'undefined') {
					finalData[p] = _exists;
				}

			});

			// console.log('has proj', options.$projection);
		}

		// @@ else when there's no need for projectioning
		else {
			finalData = data;
		}

	}


	// @@ free mem
	has_where = null;
	has_search = null;
	has_includes = null;
	has_projection = null;

	// console.log(' finalData 00 -->', 'finalData', finalData.__creator_, final_status, '\n ----------------- data_data_ ---data_ ', data_ );
	// console.log(' finalData 00 -->',  ran_++, data_ );


	// __creator_: data_.__creator_

	return { status: final_status, data: finalData }

}