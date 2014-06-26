var sys = require('sys');
var path = require('path');
var linereader = require('line-reader');
var getdatetime = require('./getdatetime.js');
var global = require("./global.js");

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


    var i;
    var all_length = logs_stats.lfu_stats.length;
    console.log("items numbers: "+all_length);

    for(i =0 ;i <all_length; i++)
    {
//        console.log(logs_stats.lfu_stats[i]);

        //(function(i){})(i)
        (function(i){
        file_path = logs_stats.lfu_stats[i].log_file;
        date_time = logs_stats.lfu_stats[i].last_modify_time;
        count = logs_stats.lfu_stats[i].pv;
        connection.query('INSERT INTO '+ global.CDN_FILE_LFU_STATS +' SET file_path = ?, last_visit_time = ?, visit_count = ?, lfu_weight = ? ON DUPLICATE KEY UPDATE visit_count = visit_count + ?, last_visit_time = ?',
                [file_path, date_time, count, 23, count, date_time], function(err, results) {
                                if(err)
                                {
                                    console.log("ClientReady Error: " + error.message);
                                    connection.end();
                                }
                                if(i == (all_length -1))
                                {
                                    console.log("all of items : "+all_length);
                                    connection.end();
                                }
                                else
                                {
                                    //console.log(i +'--Inserted: ' + results.affectedRows + ' row.');
                                    console.log(i +'--Id inserted: ' + results.insertId);
                                }
                });
       })(i);
    }
}

exports.write2mysql = write_log_to_mysql;
