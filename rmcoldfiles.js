var fs = require('fs');
var exec = require('child_process').exec;
var global = require("./global.js");
var DOWORK_T = global.DOWORK_T;

function rmcoldfiles(connection){

    connection.query("SELECT c.file_path_id AS file_path_id, p.file_path AS file_path, c.visit_count AS visit_count, time_to_sec(timediff(now(), last_visit_time)) AS difftime, p.file_size AS file_size FROM cdn_file_records AS  p, cdn_file_lfu_stats AS c WHERE p.id = c.file_path_id ORDER BY file_size DESC", function(err, rows, fields){
        if (err) throw err;
        var i;
        var all_rows_length = rows.length;
        for(i = 0; i < all_rows_length; i++)
        {   
            var flag = false;
            var child = exec("df -a --output=pcent,source|grep sda|awk '{print $1}'",
            function (err, stdout, stderr) {
                  if (err) {
                        console.log('exec error: ' + err);
                        return ;
                  }
                  console.log('stdout: ');
                  console.log("pcent: " + parseInt(stdout));
                  if(global.disk_used_level > parseInt(stdout))
                  {
                      connection.end();
                      process.exit(0);
                  }
            });

            if(rows[i].difftime > 20*DOWORK_T)
            {
                    flag = true;
            }
            else if(rows[i].difftime > 10*DOWORK_T)
            {
                if(rows[i].visit_count < 1000)
                    flag = true;
            }
            else if(rows[i].difftime > 5*DOWORK_T)
            {
                if(rows[i].visit_count < 500)
                    flag = true;
            }
            else if(rows[i].difftime > 3*DOWORK_T)
            {
                if(rows[i].visit_count < 300)
                    flag = true;
            }
            else if(rows[i].difftime > 2*DOWORK_T)
            {
                if(rows[i].visit_count < 200)
                    flag = true;
            }
            else if(rows[i].difftime > DOWORK_T)
            {
                if(rows[i].visit_count < 100)
                    flag = true;
            }

            if(true == flag)
            {
                var file_path_id = rows[i].file_path_id;
                var file_path = rows[i].file_path;

                (function(file_path_id, file_path, i, all_rows_length){
                    var vfile_path = global.DOCUMENT_ROOT_PATH + file_path;
                    fs.unlink(vfile_path, function(err){
                        if(err)
                        {
                            console.log("remove " +vfile_path + "  error" );
                            if(i == all_rows_length -1)
                            {
                                console.log('remove error, flag = true, exit with 0');
                                connection.end();
                                process.exit(0);
                            }
                            return ;
                        }
                        console.log("remove "+vfile_path +" ok");
                        connection.query("DELETE p, c FROM " + global.CDN_FILE_RECORD +" AS p JOIN " + global.CDN_FILE_LFU_STATS + " AS c ON p.id = c.file_path_id WHERE c.file_path_id = " + file_path_id, function(err) {
                            if (err) throw err;
                            console.log("delete a item(file_path_id="+file_path_id+") "+ "from cdn_file_lfu_stats "+ "and delete a item(id="+file_path_id+") "+"from cdn_file_records");
                            if(i == all_rows_length -1)
                            {
                                console.log('flag = true, exit with 0');
                                connection.end();
                                process.exit(0);
                            }
                         });
                   }); 
                })(file_path_id,file_path, i, all_rows_length);
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
    }); 
}

exports.rmcoldfiles = rmcoldfiles;
