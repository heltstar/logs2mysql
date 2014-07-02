var sys = require('sys');
var fs = require('fs');
var path = require('path');
var readline = require("readline");
var querystring = require('querystring');
var getdatetime = require('./getdatetime.js');
var global = require("./global.js");
var write2mysql = require('./write2mysql.js');

var logs_stats = global.logs_stats;
var last_all_logfiles_info_path = global.HISTORY_ROOT_PATH + global.last_all_logfiles_info;

function get_from_logs(){
    var ob;
    try{
        delete require.cache[require.resolve(last_all_logfiles_info_path)];
        ob = require(last_all_logfiles_info_path);
    }
    catch(err)
    {
        console.log("writewmysql(): " + last_all_logfiles_info_path +" is not exist:"+err);
        path.exit(1);
    }
    var str = JSON.stringify(ob);
    var obj2 = JSON.parse(str);
    var logfiles_length = Object.keys(obj2).length;
    for(key in obj2) 
    {
        console.log(key +"---"+ obj2[key].last_modify_time +"---"+obj2[key].offset + "---" + obj2[key].file_sizes);
    }

    var file_path = "";
    var date_time= "";
    var finish_cnt = 0;
//    console.log("start open access.log .............");
    for(key in obj2){
        var rd = readline.createInterface({
            input: fs.createReadStream(key, {flags:'r', mode:0644, start:obj2[key].offset, end:obj2[key].file_sizes}),
            output: process.stdout,
            terminal: false
        });

//    console.log("start read access.log line.............");
    (function(){
    rd.on('line', function(line){
            var arr, item, child_arr, child_item;
//            console.log(line);
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
                    if(-1 == file_path.indexOf("."))
                    {
//                        console.log("is not file, maybe dir... ");
                        return ;
                    }
                }
                else if(4 == item)
                {
                    if(arr[item] == "404")
                    {
 //                       console.log("file not found: 404");
                        return;
                    }
                }
            }
            if(file_path != "/")
            {
                if(logs_stats[file_path] != null)
                {   
                    logs_stats[file_path].pv += 1;
                    if(logs_stats[file_path].last_modify_time < date_time)
                    {   
                        logs_stats[file_path].last_modify_time = date_time;
                    } 
                }   
                else
                {
                    logs_stats[file_path] = {};
                    logs_stats[file_path].pv = 1;
                    logs_stats[file_path].last_modify_time = date_time;
                }
                //console.log(logs_stats[file_path]);
            }
    }).on("close",function(err) {
            if(err)console.log("readCreatem close error: " + err); 
            console.log(finish_cnt + ": finish_cnt readCreatem close ok"); 
            if(finish_cnt == logfiles_length - 1)
            {
                console.log("---all files read ok---");
                write2mysql.write2mysql();
            }
            finish_cnt++;
            
    }).on("error",function(err) {
            console.log("readCreatem error: " + err); 
    });
    })();
    }

}

exports.getfromlogs = get_from_logs;
