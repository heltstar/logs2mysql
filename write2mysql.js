
var sys = require('sys');
var fs = require('fs');
var readline = require('readline');
var fun = require('./fun.js');
//var jsonarr = require('./log_process_record.json');
var ob = require("./log_process_record.json");

var str = JSON.stringify(ob);
var obj2 = JSON.parse(str);
var length = eval(obj2.logfiles).length;
console.log("lenght="+ length);
for(var i=0; i < length; i ++) 
{
    console.log(obj2["logfiles"][i].log_file +":"+ obj2["logfiles"][i].last_modify_time +":"+obj2["logfiles"][i].offset);
}


var logs_stats = {lfu_stats:[]}; 
var row = {"log_file": "access.log","last_modify_time": 24, "offset": 566, "pv":1};

var file_path = "";
var date_time= "";
var json_all ="";
//var log_src = "./access.log";

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

var num;
for(var i = 0; i < length; i++)
{
console.log("./"+obj2["logfiles"][i].log_file);
    var rd = readline.createInterface({
//input: fs.createReadStream(log_src),
input: fs.createReadStream("./"+obj2["logfiles"][i].log_file),
output: process.stdout,
terminal: false
});

rd.on('line', function(line) {
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
        connection.query('INSERT INTO '+ TABLE +' '+ 'SET file_path = ?, last_visit_time = ?, lfu_weight = ? ON DUPLICATE KEY UPDATE visit_count = visit_count + 1, last_visit_time = ?',
            [file_path, date_time, 23, date_time]);  
        });
}





/*
   connection.query('SELECT * from ' + TABLE, function(err, rows, fields) {
   if (err) throw err;
   console.log("rows.length:"+rows.length);
   for(var i = 0; i < rows.length; i++)
   {   
//console.log('The solution is: ', rows[i].id, rows[i].firstname,  rows[i].lastname, rows[i].message);
console.log(rows[i]);
}   
}); 

connection.query('DELETE from cdn_file_lfu_stats where lfu_weight < 1', function(err, rows, fields) {
if (err) throw err;
console.log("delete ok");
}); 
 */
//connection.end();
