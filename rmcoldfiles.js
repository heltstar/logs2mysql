var fs = require('fs');
var mysql  = require('mysql');
var global = require("./global.js");
var T = global.T;

function rmcoldfiles(){
    var connection = mysql.createConnection({
            host     : global.host,
            port     : global.port,
            user     : global.user,
            password : global.password,
            database : global.database,
        });
    connection.connect();

    var file_path;
    var file_path_record;
    var flag = false;

    connection.query('SELECT file_path_id, visit_count, time_to_sec(timediff(now(), last_visit_time)) AS difftime  FROM ' + global.CDN_FILE_LFU_STATS, function(err, rows, fields) {
        if (err) throw err;
        for(var i = 0; i < rows.length; i++)
        {   
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
                file_path_id = rows[i].file_path_id;

                connection.query('SELECT * FROM ' + global.CDN_FILE_RECORD + ' WHERE id= ' + file_path_id,  function(err, rows, fields) {
                    if(err)
                    {
                        console.log("select error");
                        return ;
                    }
                    if(null == rows[0])
                    {
                        console.log("warn: select 0 item");
                        return ;
                    }
                    file_path = global.ROOT_PATH + rows[0].file_path;

                    fs.unlink(file_path, function(err){
                        if(err)
                        {
                            console.log("remove file error");
                            return ;
                        }
                        console.log("remove file "+file_path +" ok");
                        connection.query('DELETE FROM ' + global.CDN_FILE_LFU_STATS + ' WHERE file_path_id=' + file_path_id, function(err) {
                            if (err) throw err;
                            console.log("delete a item from cdn_file_lfu_stats ");
                            connection.query('DELETE FROM ' + global.CDN_FILE_RECORD + ' WHERE id =' + file_path_id, function(err) {
                                if (err) throw err;
                                console.log("delete a item from cdn_file_records");
                            });
                        }); 
                    });
                });
            }
        }
    }); 
}
//connection.end();


exports.rmcoldfiles = rmcoldfiles;
