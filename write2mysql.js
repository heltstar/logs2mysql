var sys = require('sys');
var linereader = require('line-reader');
var fun = require('./fun.js');

var ob = require("./log_history.json");
//var ob = require("./log_process_record.json");

var str = JSON.stringify(ob);
var obj2 = JSON.parse(str);
var logfiles_length = eval(obj2.logfiles).length;
console.log("logfiles_lenght="+ logfiles_length);
for(var i=0; i < logfiles_length; i ++) 
{
    console.log(obj2["logfiles"][i].log_file +"---"+ obj2["logfiles"][i].last_modify_time +"---"+obj2["logfiles"][i].offset);
}

var file_path = "";
var date_time= "";

var DATABASE = 'cdn_db';
var TABLE = 'cdn_file_lfu_stats';

var mysql      = require('mysql');
var connection = mysql.createConnection({
host     : '192.168.56.101',
port     : 3306,
user     : 'root',
password : 'wangjian',
database : 'cdn_db',
});
connection.connect();

var logs_stats = {lfu_stats:[]}; 

for(var cnt = 0; cnt < logfiles_length; cnt ++){
    linereader.eachLine(obj2["logfiles"][cnt].log_file, function(line) {
//        console.log(line);
        var arr, item, child_arr, child_item;
        arr =line.split(" - ", 8);
        for(item in arr) 
        {
        if(1 == item)
        {
        date_time = fun.getdatetime(arr[item]);
        continue;
        }

        if(3 == item)
        {
        child_arr = arr[item].split(" ",3);
        file_path = child_arr[1];
        }
        }

        var length = logs_stats.lfu_stats.length;
        var j;
        for(j = 0; j < length; j++)
        {
            if(logs_stats.lfu_stats[j].log_file == file_path)
            {   
                logs_stats.lfu_stats[j].pv += 1;
                if(logs_stats.lfu_stats[j].last_modify_time < date_time)
                {   
                    logs_stats.lfu_stats[j].last_modify_time = date_time;
                }   
                break;
            }   
        }
        if(j == length)
        {
            var row = {"log_file": file_path,"last_modify_time": date_time, "pv":1};
           logs_stats.lfu_stats.push(row);
        }
    }).then(function() {
        console.log("i'm done");
        var count=0;
        var all_length = logs_stats.lfu_stats.length;
        console.log("last length: " + all_length);
        for(var i =0 ;i <all_length; i++)
        {
        console.log(logs_stats.lfu_stats[i]);
        file_path = logs_stats.lfu_stats[i].log_file;
        date_time = logs_stats.lfu_stats[i].last_modify_time;
        count = logs_stats.lfu_stats[i].pv;
        connection.query('INSERT INTO '+ TABLE +' '+ 'SET file_path = ?, last_visit_time = ?, visit_count = ?, lfu_weight = ? ON DUPLICATE KEY UPDATE visit_count = visit_count + ?, last_visit_time = ?',
            [file_path, date_time, count, 23, count, date_time]);  
        }
        });
}

