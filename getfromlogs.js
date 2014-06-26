var sys = require('sys');
var fs = require('fs');
var path = require('path');
var readline = require("readline");
var querystring = require('querystring');
var getdatetime = require('./getdatetime.js');
var global = require("./global.js");

var logs_stats = global.logs_stats;

function get_from_logs(){
    var ob;
    try{
        //delete require.cache[global.log_history];
        delete require.cache[require.resolve(global.log_history)];
        ob = require(global.log_history);
    }
    catch(err)
    {
        console.log("writewmysql(): " + global.log_history+" is not exist:"+err);
        path.exit(1);
    }
    var str = JSON.stringify(ob);
    var obj2 = JSON.parse(str);
    var logfiles_length = eval(obj2.log).length;
    for(var i=0; i < logfiles_length; i ++) 
    {
        console.log(obj2["log"][i].log_file +"---"+ obj2["log"][i].last_modify_time +"---"+obj2["log"][i].offset + "---" + obj2["log"][i].file_sizes);
    }

    var file_path = "";
    var date_time= "";

    for(var cnt = 0; cnt < logfiles_length; cnt ++){
        var rd = readline.createInterface({
            input: fs.createReadStream(obj2["log"][cnt].log_file, {start:obj2["log"][cnt].offset, end:obj2["log"][cnt].file_sizes}),
            output: process.stdout,
            terminal: false
        });

    rd.on('line', function(line){
            var arr, item, child_arr, child_item;
            arr =line.split(" - ", 8);
            for(item in arr) 
            {
                if(1 == item)
                {
                    date_time = getdatetime.getdatetime(arr[item]);
                }
                else if(3 == item)
                {
                    child_arr = arr[item].split(" ",3);
                    file_path = child_arr[1];
                    var index = file_path.indexOf("?");
                    if(-1 != index)
                    {
                        file_path = file_path.substring(0, index);
                    }
                    file_path = querystring.unescape(file_path);
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
    });
    }
}

exports.getfromlogs = get_from_logs;
