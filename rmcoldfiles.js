var fs = require('fs');
var global = require("./global.js");
var T = global.T;

function rmcoldfiles(connection){

    var file_path;

    connection.query('SELECT file_path_id, visit_count, time_to_sec(timediff(now(), last_visit_time)) AS difftime  FROM ' + global.CDN_FILE_LFU_STATS, function(err, rows, fields) {
        if (err) throw err;

        var i;
        var all_rows_length = rows.length;
        for(i = 0; i < rows.length; i++)
        {   
            var flag = false;
            if(rows[i].difftime > 20*T)
            {
                    flag = true;
            }
            else if(rows[i].difftime > 10*T)
            {
                if(rows[i].visit_count < 1000)
                    flag = true;
            }
            else if(rows[i].difftime > 5*T)
            {
                if(rows[i].visit_count < 500)
                    flag = true;
            }
            else if(rows[i].difftime > 3*T)
            {
                if(rows[i].visit_count < 300)
                    flag = true;
            }
            else if(rows[i].difftime > 2*T)
            {
                if(rows[i].visit_count < 200)
                    flag = true;
            }
            else if(rows[i].difftime > T)
            {
                if(rows[i].visit_count < 100)
                    flag = true;
            }

            if(true == flag)
            {
                var file_path_id = rows[i].file_path_id;
                (function(file_path_id, i, all_rows_length){
                connection.query('SELECT * FROM ' + global.CDN_FILE_RECORD + ' WHERE id= ' + file_path_id,  function(err, rows, fields) {
                    if(err)
                    {
                        console.log("select error");
                        process.exit(1);
                        //return ;
                    }
                    if(null == rows[0])
                    {
                        console.log("err: select 0 item");
                        process.exit(1);
                        //return ;
                    }
                    file_path = global.ROOT_PATH + rows[0].file_path;
                    fs.unlink(file_path, function(err){
                        if(err)
                        {
                            console.log("remove " +file_path + "  error" );
                            if(i == all_rows_length -1)
                            {
                                console.log('remove error, flag = true, exit with 0');
                                connection.end();
                                process.exit(0);
                            }
                            return ;
                        }
                        console.log("remove "+file_path +" ok");
                        connection.query('DELETE FROM ' + global.CDN_FILE_LFU_STATS + ' WHERE file_path_id=' + file_path_id, function(err) {
                            if (err) throw err;
                            console.log("delete a item(file_path_id="+file_path_id+") "+ "from cdn_file_lfu_stats ");
                            connection.query('DELETE FROM ' + global.CDN_FILE_RECORD + ' WHERE id =' + file_path_id, function(err) {
                                if (err) throw err;
                                console.log("delete a item(id="+file_path_id+") "+"from cdn_file_records");

                                if(i == all_rows_length -1)
                                {
                                    console.log('flag = true, exit with 0');
                                    connection.end();
                                    process.exit(0);
                                }
                            });
                        }); 
                    });
                });
                })(file_path_id,i, all_rows_length);
            }
            else
            {
                if(i == all_rows_length -1)
                {
                    console.log('flag = false, exit with 0');
                    connection.end();
                    process.exit(0);
                }
            }
    }

        //process.exit(0);
    }); 
}
//connection.end();


exports.rmcoldfiles = rmcoldfiles;
