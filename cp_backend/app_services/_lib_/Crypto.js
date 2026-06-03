export const Crypto = {};

let config = {
	auth_expires: 3600
}

const eng_let_nums = {

	'a': 5,
	'b': 11,
	'c': 17,
	'd': 13,
	'e': 1,
	'f': 25,
	'g': 16,
	'h': 22,
	'i': 3,
	'j': 12,
	'k': 26,
	'l': 29,
	'm': 4,
	'n': 24,
	'o': 14,
	'p': 7,
	'q': 23,
	'r': 18,
	's': 28,
	't': 27,
	'u': 21,
	'v': 8,
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
	'A': 40,
	'B': 41,
	'C': 42,
	'D': 43,
	'E': 44,
	'F': 45,
	'G': 46,
	'H': 47,
	'I': 48,
	'J': 49,
	'K': 50,
	'L': 51,
	'M': 52,
	'N': 53,
	'O': 54,
	'P': 55,
	'Q': 56,
	'R': 57,
	'S': 58,
	'T': 59,
	'U': 60,
	'V': 61,
	'W': 62,
	'X': 63,
	'Y': 64,
	'Z': 65,

	'-': 66,
	' ': 67,

	'@': 20,
	'_': 19,
	'.': 10,

	'*': 72,
	'#': 73,
	'%': 74,
	'$': 75,

	'~': 76,
	'=': 77,
	'^': 78,
	'\\': 79,
	'[': 80,
	']': 81,
	'(': 82,
	')': 83,
	'+': 84,
	'{': 85,
	'}': 86,
	'/': 87,
	'|': 88,
	':': 89,
	'"': 90,
	'\'': 91,
	'?': 92,
	',': 93,
	';': 94,
	'!': 95,
	'&': 96

};

const upperAlpha_dividers = [
	'A', 'B', 'C', 'D', 'E', 'F',
	'G', 'H', 'I', 'J', 'K', 'L',
	'M', 'N', 'O', 'P', 'Q', 'R',
	'S', 'T', 'U', 'V', 'W', 'X',
	'Y', 'Z'
];

const alpha_keys = {
	'0': '1',
	'1': 'a',
	'2': '4',
	'3': 'k',
	'4': '9',
	'5': 'f',
	'6': 'g',
	'7': '6',
	'8': 'v',
	'9': 'w',
};

function switch_obj(obj) {
	let nu_obj = {};
	let a = Object.keys(obj),
		al = a.length
	for (let u = 0; u < al; u++) {
		nu_obj[obj[a[u]]] = a[u];
	}
	return nu_obj;
};

function rand_num_btw_1_and(num) {
	return Math.floor((Math.random() * num) + 1);
};

let alpha_keys_switch = switch_obj(alpha_keys);
let reverse_alpha = switch_obj(eng_let_nums);


function alpha_of_num(num) {
	let f = '';
	num = "" + num;
	num.split('').forEach(n => {
		f += alpha_keys[n].toUpperCase();
	})
	return f
}

function num_of_alpha(alpha) {
	let f = '';
	alpha.split('').forEach(a => {
		f += alpha_keys_switch[a.toLowerCase()];
	})
	return parseInt(f)
}

// @@ encode a string
Crypto.encode = function (text_to_encode) {

	// console.log('k ===>', "==>", stringToEncode, '\n');
	let curr_timestamp_rand = "" + (Date.now() * 33 / 41);

	curr_timestamp_rand = curr_timestamp_rand.split('.')[1] || '9354';

	
	curr_timestamp_rand = parseInt(curr_timestamp_rand);

	// -28 error hck
	curr_timestamp_rand = curr_timestamp_rand < 1001 ? 1807 : curr_timestamp_rand;

	let _l = text_to_encode.length;
	let nuStru = [];
	// let origoNum = [];


	// @@ extract each char
	let run_keys = function () {

		let arr = [];
		// -- then find from key it
		for (let i = 0; i < _l; i++) {

			// origoNum.push(eng_let_nums[stringToEncode[i]]);

			// console.log('curr_timestamp_rand :: ->', curr_timestamp_rand, (eng_let_nums[text_to_encode[i]] * 2), eng_let_nums[text_to_encode[i]], text_to_encode[i], (curr_timestamp_rand - (eng_let_nums[text_to_encode[i]] * 2)) )
			arr.push("" + (curr_timestamp_rand - (eng_let_nums[text_to_encode[i]] * 2)));
			// console.log( 'scot ==>', stringToEncode[i], (eng_let_nums[stringToEncode[i]] * 2) - 1 );
			arr.push(upperAlpha_dividers[rand_num_btw_1_and(25)]);
		}

		// the -28, problem fix
		// -- troubleshoot cuase later

		return arr
	}
	
	nuStru = run_keys();

	// console.log(' nuStru nuStru ---> :: --> ', text_to_encode, nuStru);

	if (nuStru[0].indexOf('-') > -1) {
		run_keys()
	}

	else {

		let curr_timestamp_alpha = alpha_of_num(curr_timestamp_rand);
		return nuStru.join('') + '-' + curr_timestamp_alpha;
	}


	

	// 	nuStru nuStru ---> :: -->  $uid$ [ -28, "O", 80, "H", 116, "F", 96, "W", -28, "W" ]
	// 	nuStru nuStru ---> :: -->  t5e2s6t4319383980023350c1a1 [
	// 	 68, "T", 52, "U", 120, "P", 58, "G", 66, "Z", 50, "P", 68, "D", 54, "N", 56, "C", 60, "Q", 44, "H", 56,
	// 	 "U", 46, "H", 56, "G", 44, "F", 46, "X", 62, "J", 62, "R", 58, "W", 56, "Y", 56, "N", 52, "M", 62, "U",
	// 	 88, "S", 60, "F", 112, "O", 60, "Y"
	//    ]

	// let curr_timestamp_alpha = alpha_of_num(curr_timestamp_rand);
	// return nuStru.join('') + '-' + curr_timestamp_alpha;

};

Crypto.tokenToObj = function (tok) {

	let a = tok.split('~');
	let l = a.length;
	let decodedTokObj = {};

	if (l == 0) { return decodedTokObj }

	for (let i = 0; i < l; i++) {

		// console.log(a[i]);
		let k = Crypto.decoder(a[0]);
		let v = Crypto.decoder(a[1]);
		decodedTokObj[k] = v;
	}

	return decodedTokObj

};

Crypto.encode_token = (userData, exactKeyToEncode) => {

	let startTime = Date.now();
	let TokenConstructor = [];
	// let _r = '';

	// console.log('Starting Encoder..', startTime, userData);
	// console.log( 'yoyo ==>', Crypto.encode('sys@theadmin.com') );

	// 0. Encode single if exactKeyToEncode is passed 

	// console.log('yii ==>', lowerAplha_['9'], lowerAplha_['A'], lowerAplha_['a'] );

	let _now = "" + Date.now();

	// if (typeof exactKeyToEncode == 'string') {
	// 	return Crypto.encode(exactKeyToEncode)+'~'+Crypto.encode(userData[exactKeyToEncode])+'--'+Crypto.encode('bk__t_t')+'~'+Crypto.encode(_now);
	// }

	// -------------- or ---------------- 

	// 1. get all the keys
	let _keys = Object.keys(userData);
	_keys.forEach(k => {

		let keyToken = Crypto.encode(k);
		let valToken = Crypto.encode(userData[k]);

		// console.log(' k, keytoken :: -->', k, ' :: ', keyToken);
		// console.log(' vk, valToken :: -->', userData[k], ' :: ', valToken);

		TokenConstructor.push(keyToken + '~' + valToken);

	});

	// console.log('yii ==>', lowerAplha_['9'], lowerAplha_['A'], lowerAplha_['a'] );
	// console.log('yii ==>', TokenConstructor);

	return TokenConstructor.join('--') + '--' + Crypto.encode('bk__t_t') + '~' + Crypto.encode(_now);
}

// @@ DeCoder  ------------------------------------------====================

Crypto.decoder = function (tokenTodecode) {

	// let tokenTodecode = await Crypto.encode(testUser);

	// console.log('tokenTodecode', tokenTodecode);

	let tokenTodecodeA = tokenTodecode.split('-');

	if (tokenTodecodeA.length < 2) { return '' }


	tokenTodecode = tokenTodecodeA[0].trim();

	let curr_timestamp_alpha = tokenTodecodeA[1].trim();
	let curr_timestamp_num = num_of_alpha(curr_timestamp_alpha);

	// console.log('Starting Decocoder for ..', tokenTodecode, curr_timestamp_num );
	// 2. Decode each letter based on an algorithm
	// i. first get the numero equivalent

	let ll = tokenTodecode.length;
	let filteredStr = '';
	for (let k = 0; k < ll; k++) {

		filteredStr += upperAlpha_dividers.indexOf(tokenTodecode[k]) == -1 ? tokenTodecode[k] : '_';
	}


	filteredStr = filteredStr.split('_');
	let _l = filteredStr.length;
	let decodedStrArray = [];

	// @@ extract each char
	let y;
	let finalDecodedStr = '';

	// -- then find from key

	for (let i = 0; i < _l; i++) {

		if (filteredStr[i] !== '') {
			let x = (curr_timestamp_num - filteredStr[i]) / 2;
			decodedStrArray.push(x);
		}
	}

	let dl = decodedStrArray.length;
	for (let i = 0; i < dl; i++) {
		finalDecodedStr += reverse_alpha[decodedStrArray[i]];
	}

	return finalDecodedStr
}

Crypto.decode = (tokenStr) => {

	// tokenStr = tokenStr.replace('__e_ky_', '');

	let decodedTok = {};

	// @@ -- for multikeys -- obj tokens
	if (tokenStr.indexOf('--') > -1) {


		let eachKey = tokenStr.split('--');

		eachKey.forEach(k => {
			// console.log('each key ==>', Crypto.tokenToObj(k));
			let dt = Crypto.tokenToObj(k);
			let okk = Object.keys(dt)[0];
			// Crypto.tokenToObj(k);   
			decodedTok[okk] = dt[okk];
		});

		return decodedTok

	}

	else {

		return Crypto.decoder(tokenStr);

	}

	// return {isActive: false, isValid: false } 

	// @@ wont run because of added time
	// return Crypto.tokenToObj(tokenStr);   
	// return decodedTok;
}


Crypto.decode_token = (tokenStr) => {

	// tokenStr = tokenStr.replace('__e_ky_', '');
	let decodedTok = {};

	// @@ -- for multikeys
	if (tokenStr.indexOf('--') > -1) {



		let eachKey = tokenStr.split('--');

		eachKey.forEach(k => {
			// console.log('each key ==>', Crypto.tokenToObj(k));
			let dt = Crypto.tokenToObj(k);
			let okk = Object.keys(dt)[0];
			// Crypto.tokenToObj(k);   
			decodedTok[okk] = dt[okk];
		});

		// console.log( 'tok hit', decodedTok);

		if (decodedTok.hasOwnProperty('bk__t_t')) {
			decodedTok.isValid = true;
		}

		// @@ if token is still valid based on how much time from a set timestamp
		if (decodedTok.isValid) {
			// console.log( (Date.now() - parseInt(decodedTok.bk__t_t)) / 1000 );
			let timeSinceIssued = (Date.now() - parseInt(decodedTok.bk__t_t)) / 1000;

			// console.log( timeSinceIssued  );

			if (timeSinceIssued > config.auth_expires) {  // 3 hours before reauth was formerly 600 - 10 mins
				decodedTok.isActive = false;
			}
			else {
				decodedTok.isActive = true;
			}

			// @@ timeSinceIssued in seconds
			decodedTok.timeSinceIssued = timeSinceIssued;
		}


		// @@ refresh date used on every decode request
		// @@ if tok is still active
		// if (decodedTok.isValid && decodedTok.isActive) {
		// 	let new_now = ""+Date.now();
		// 	// decodedTok.bk__t_t = Crypto.encoder(new_now);
		// 	decodedTok.bk__t_t = new_now;
		// 	new_now = null;
		// }

		return decodedTok
		// console.log(decodedTok);
	}

	return { isActive: false, isValid: false }

	// @@ wont run because of added time
	// return Crypto.tokenToObj(tokenStr);   
	// return decodedTok;
}

function main() {

	// let crypt = Crypto.encode('vicman12');
	// console.log(' Crypto Encrypt ---->', crypt );
	// let decrypted_text = Crypto.decode(crypt);


	// let decrypted_text = Crypto.decode(tok_);
	let data = {
		_uid: 'vicman_coki',
		role: 'akara'
	}

	let toks = Crypto.encode_token(data);

	let decoded_toks = Crypto.decode_token('4596C4592H4628L4608H-9GK9~4618E4628B4600R4626T4624Y4586H4558Z4556R4562I4560E4560K4560C4594T-9GK9--4598O4606O4576B4632J-9GK9~4624I4582X4624W4598J4624V-9GK9--4612P4582C4596E4596G4580T4596C4580K-9GK9~4572F4560H4574I4556I4572Z4566E4570T4568E4572Z4566Q4568Q4562C4566I-9GK9');

	// console.log(' Crypto Decrypt ---->', decrypted_text );
	console.log(' Crypto Encrypt Token ---->', toks, '\n -----> res ', decoded_toks);

};

function main2() {

	let u = 0;
	function runner() {

		u++;
		let uo = {
			$uid$: "t1e0s3t59760969618728620c1a1",
			role: "_cpx_user",
		};
		let token = Crypto.encode_token(uo);

		let k = "-28Y80E116N96F-28U-A44~68M60W120K62N66V56U68Y52P44I48U50C62P44S50H44V50S60B46Z48O58I46X50J58D62L88E60Z112H60R-A44--86I94X64Z120K-A44~84G88X108V92Q84Z80E66D120P86M-A44--100U70C84R84J68S84U68K-A44~60J48S58K56B44X50Q50S54Q44R52O50N52R56G-A44";
		let res = Crypto.decode(token);

		console.log('decoc --->', '\n token -> ', token, '\n -> ', res, ' --> ', u);

		if (res.$uid$) {

			setInterval(function () {
				runner();
			}, 20);
		}

	}

	runner()


}
// Lisq Water 

// Dabiri Solomon
// main2();
// console.log(Crypto.encode('12345678'), '\n -----> King&Champ1 >>>> ', Crypto.encode('King&Champ1'), '\n >>> ',);
// console.log(Crypto.decode('1707X1801R1759D1775G1615E1723N1763B1797L1799B1793I1745S-AV16'));

// bun --watch _lib_/Crypto.js

