

export const long_API_processor = async (req, url, backendHeaders, numHits, node) => {

    backendHeaders = backendHeaders || {};

	try {

        return new Promise( (resolve, reject) => {


            setTimeout( function() {
                resolve({
                    success: true,
                    status: 200,
                    data: { msg: 'Long function ran' }
                })
            }, 12000)

        })


    }
	catch (err) {
		console.log('err API processor -->', err);
	}

};