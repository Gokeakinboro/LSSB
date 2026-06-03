import fs from 'node:fs';

export const create_extra_collections = async function(config) {


    // console.log(' create_extra_collections confff :: ---> ', config.additional_collections );

    config.additional_collections.forEach( col => {


        // console.log( 'col :: -> ', col );

        if ( !fs.existsSync(`${config.db_data_dir}/${col}`) ) {

            fs.mkdir(`${config.db_data_dir}/${col}`, (err) => {


                if (err) { console.error(err); return }

                if ( col == '_connections' ) {

                    config.connections.forEach( conn_type => {

                        if ( !fs.existsSync(`${config.db_data_dir}/${col}/${conn_type}`) ) {

                            fs.mkdir(`${config.db_data_dir}/${col}/${conn_type}`, (err) => {
                                if (err) { console.error(err); return }
                            })

                        }

                    });

                }
    
                console.log(` coll dir ${col} created successfully! `);

            })

        }

        else if ( col == '_connections' ) {

            config.connections.forEach( conn_type => {

                if ( !fs.existsSync(`${config.db_data_dir}/${col}/${conn_type}`) ) {

                    fs.mkdir(`${config.db_data_dir}/${col}/${conn_type}`, (err) => {
                        if (err) { console.error(err); return }
                    })

                }

            });

        }
        
    });


}