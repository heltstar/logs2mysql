var sys = require('sys');
var sys = require('sys');
var exec = require('child_process').exec;
var path = require('path');
var linereader = require('line-reader');
var getdatetime = require('./getdatetime.js');
var global = require("./global.js");
var rmcoldfiles = require("./rmcoldfiles.js");

var logs_stats = global.logs_stats;

function write_log_to_mysql(){

    var file_path = "";
    var date_time= "";
    var count=0;

    var mysql      = require('mysql');
    var connection = mysql.createConnection({
            host     : global.host,
            port     : global.port,
            user     : global.user,
            password : global.password,
            database : global.database,
        });
    connection.connect();

    var i = 0;
    var file_path_id ;
    var all_length = Object.keys(logs_stats).length;
    console.log("items numbers: "+all_length);

    for(key in logs_stats)
    {
        i++;
        console.log(i+": "+key +"----" + logs_stats[key].last_modify_time + "----"+logs_stats[key].pv);
        (function(i,key){
        file_path = key;
        connection.query('SELECT id FROM '+ global.CDN_FILE_RECORD + ' where file_path = "'+ file_path + '"', function(err, rows, fields) {
            if(err)
            {
                console.log("err...");
                throw err;
            }
            if(rows[0] == null)
            {
                console.log("not exist in " + global.CDN_FILE_RECORD +": " +key);
                process.exit(1);
            }
            file_path_id = rows[0].id;
            date_time = logs_stats[key].last_modify_time;
            count = logs_stats[key].pv;

            connection.query('INSERT INTO '+ global.CDN_FILE_LFU_STATS +' SET file_path_id = ?, last_visit_time = ?, visit_count = ?, lfu_weight = ? ON DUPLICATE KEY UPDATE visit_count = visit_count + ?, last_visit_time = ?',
                [file_path_id, date_time, count, 23, count, date_time], function(err, results) {
                                if(err)
                                {
                                    console.log("ClientReady Error: " + err.message);
                                    connection.end();
                                }
                                //if(i == (all_length -1))
                                if(i == all_length)
                                {
                                    console.log("all of items : "+all_length);
                                    
                                    var child = exec("df -a --output=pcent,source|grep sda|awk '{print $1}'",function (error, stdout, stderr) {
                                        if (error !== null) {
                                            console.log('exec error: ' + error);
                                        }
                                        console.log("disk used pcent: " + parseInt(stdout));
                                        global.disk_used_now = parseInt(stdout);
                                        if(global.disk_used_now >= global.disk_used_level)
                                        {
                                            console.log(global.disk_used_now + " >= "+ global.disk_used_level + ': must to remove cold files now.');
                                            rmcoldfiles.rmcoldfiles(connection);
                                        }
                                        else
                                        {
                                            console.log(global.disk_used_now + " < "+ global.disk_used_level + ': not need to remove cold files.');
                                            connection.end();
                                            //process.exit(0);
                                        }
                                    });
                                }
                                else
                                {
                                   //console.log(i +'--Inserted: ' + results.affectedRows + ' row.');
                                   //console.log(i +'--Id inserted: ' + results.insertId);
                                   //i++;
                                }
                });
                });
       })(i,key);
    }
}

exports.write2mysql = write_log_to_mysql;
