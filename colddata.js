var sys = require('sys');
var fs = require('fs');
var path = require('path');
var readline = require("readline");
var querystring = require('querystring');
var exec = require('child_process').exec;

var DOWORK_T ;
var RESET_T ;
var disk_used_level ;
var DOCUMENT_ROOT_PATH ;
var HISTORY_ROOT_PATH ;
var LOG_ROOT_PATH ;
var last_all_logfile_info ;
var lastResetTime ;
var last_all_logfiles_info_path ;
var lastResetTimeFile ;
var connection;
var cdn_file_lfu_stats ;
var cdn_file_records ;

var logs_stats = {};

var disk_total_size = 0;
var disk_used_size = 0;
var disk_used_now = 0;

function getdatetime(timestr)
{
    var firstdot = timestr.indexOf(":");
    var firstnull = timestr.indexOf(" ");
    var time = timestr.substring(firstdot+1, firstnull);

    var date = timestr.substring(0,firstdot);
    var arr = date.split("/");
    var day = arr[0];
    var month = arr[1];
    var year = arr[2];

    var month_arr = {   
    "Jan":"01",
    "Feb":"02",
    "Mar":"03", 
    "Apr":"04", 
    "May":"05", 
    "Jun":"06",
    "Jul":"07", 
    "Aug":"08",
    "Sep":"09",
    "Oct":"10",
    "Nov":"11",
    "Dec":"12"
    };

    var str = year + "-" + month_arr[month] + "-" + day + " " + time;
    return str;
}

function fileExistinJson(file)
{
    var ob;
    try {
        delete require.cache[require.resolve(last_all_logfiles_info_path)];
        ob = require(last_all_logfiles_info_path);
    }
    catch(err)
    {
        console.log("exist_json() error: "+err);
        return null;
    }

    var str = JSON.stringify(ob);
    var obj2 = JSON.parse(str);

    return obj2[file];
}

function w(){
    fs.writeFile(lastResetTimeFile, (new Date()).getTime(), function(err){
            if(err) throw err;
            });
}

function r(connection){
    fs.readFile(lastResetTimeFile, function(err, data){
            if(err) throw err;
            var now = (new Date()).getTime();
            var difftime = now - parseInt(data);

            if(difftime >= RESET_T)
            {
                connection.query("DELETE FROM " + cdn_file_lfu_stats, function(err){
                            if(err)throw err;
                            console.log("reset " + cdn_file_lfu_stats + " success.");
                });
                w();
            }
    });
}

function resetmysql(connection){
    disk_used_size = 0;
    disk_total_size = 0;
    disk_now_used = 0;
    if(false == fs.existsSync(lastResetTimeFile))
    {
        console.log(lastResetTimeFile + ' not exist.');
        w();
        return ;
    }
    r(connection);
}

function rmcoldfiles(connection){

    connection.query("SELECT c.file_record_id AS file_record_id, p.file_path AS file_path, c.visit_count AS visit_count, time_to_sec(timediff(now(), last_visit_time)) AS difftime, p.file_size AS file_size FROM cdn_file_records AS  p, cdn_file_lfu_stats AS c WHERE p.id = c.file_record_id ORDER BY file_size DESC", function(err, rows, fields){
        if (err) throw err;
        var i;
        var all_rows_length = rows.length;
        console.log("mysql items numbers: " + all_rows_length);
        for(i = 0; i < all_rows_length; i++)
        {   
            var flag = false;
            //console.log("rmcoldfiles for: " + i);
            if(disk_used_level > disk_used_now)
            {
                  console.log("disk_used_level > disk_used_now ,  resetmysql()");
                  resetmysql(connection);
                  return ;
            }

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
                var file_record_id = rows[i].file_record_id;
                var file_path = rows[i].file_path;
                disk_used_now = (disk_used_size - rows[i].file_size)/disk_total_size * 100;

                (function(file_record_id, file_path, i, all_rows_length){
                    var vfile_path = DOCUMENT_ROOT_PATH + file_path;
                    fs.unlink(vfile_path, function(err){
                        if(err)
                        {
                            if(i == all_rows_length -1)
                            {
                                console.log('error: '+ err.message);
                                console.log('i == all_rows_length, query mysql table end.');
                                resetmysql(connection);
                            }
                            else
                            {
                                console.log("error: "+ err.message );
                            }
                            return ;
                        }
                        console.log("remove "+vfile_path +" ok");
                        connection.query("DELETE p, c FROM " + cdn_file_records +" AS p JOIN " + cdn_file_lfu_stats + " AS c ON p.id = c.file_record_id WHERE c.file_record_id = " + file_record_id, function(err) {
                            if (err) throw err;
                            console.log("delete a item(file_record_id="+file_record_id+") "+ "from cdn_file_lfu_stats "+ "and delete a item(id="+file_record_id+") "+"from cdn_file_records");
                            if(i == all_rows_length -1)
                            {
                                console.log('flag = true, exit with 0');
                                resetmysql(connection);
                            }
                         });
                   }); 
                })(file_record_id,file_path, i, all_rows_length);
            }
            else
            {
                if(i == all_rows_length -1)
                {
                    console.log('flag = false, exit with 0');
                    resetmysql(connection);
                }
                else
                {
                    //console.log(i + ': flag = false...  ');
                }
            }
        }
    }); 
}

function writelogtomysql(){

    var file_path = "";
    var date_time= "";
    var count=0;
    var i = 0;
    var file_record_id ;

    var all_length = Object.keys(logs_stats).length;
    console.log("items numbers: "+all_length);

    for(key in logs_stats)
    {
        i++;
//        console.log(i+": "+key +"----" + logs_stats[key].last_modify_time + "----"+logs_stats[key].pv);
        (function(i,key){
        file_path = key;
        connection.query('SELECT id FROM '+ cdn_file_records + ' where file_path = "'+ file_path + '"', function(err, rows, fields) {
            if(err)
            {
                console.log("err...");
                throw err;
            }
            if(rows[0] == null)
            {
                console.log("not exist in " + cdn_file_records +": " +key);
                process.exit(1);
            }
            file_record_id = rows[0].id;
            date_time = logs_stats[key].last_modify_time;
            count = logs_stats[key].pv;

            connection.query('INSERT INTO '+ cdn_file_lfu_stats +' SET file_record_id = ?, last_visit_time = ?, visit_count = ? ON DUPLICATE KEY UPDATE visit_count = visit_count + ?, last_visit_time = ?',
                [file_record_id, date_time, count, count, date_time], function(err, results) {
                                if(err)
                                {
                                    console.log("ClientReady Error: " + err.message);
                                    return ;
                                }
                                if(i == all_length)
                                {
                                    console.log("all of items : "+all_length);
                                    
                                    for(k in logs_stats)
                                    {
                                        delete logs_stats[k];
                                    }
                                    var child = exec("df -TH -BK|grep ext4|awk '{print $3, $4}'",function (err, stdout, stderr) {
                                        if (err !== null) {
                                            console.log('exec err: ' + err);
                                        }
                                        //console.log("disk used pcent: " + stdout);
                                        //console.log("disk used pcent: " + stdout);
                                        var arr_df = stdout.split(" ",2);
                                        //console.log("disk used : " + stdout);
                                        disk_total_size = parseInt(arr_df[0]) * 1024;
                                        disk_used_size = parseInt(arr_df[1]) * 1024;
                                        disk_used_now = disk_used_size/disk_total_size * 100;
                                        if(disk_used_now > disk_used_level)
                                        {
                                            console.log(disk_used_now + " > "+ disk_used_level + ': must to remove cold files now.');
                                            rmcoldfiles(connection);
                                        }
                                        else
                                        {
                                            console.log(disk_used_now + " <= "+ disk_used_level + ': not need to remove cold files.');
                                            return ;
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

function getfromlogs(){
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

    for(key in obj2){
        var rd = readline.createInterface({
            input: fs.createReadStream(key, {flags:'r', mode:0644, start:obj2[key].offset, end:obj2[key].file_sizes}),
            output: process.stdout,
            terminal: false
        });

    (function(){
    rd.on('line', function(line){
            var arr, item, child_arr, child_item;
            arr =line.split(" - ", 8);
            for(item in arr) 
            {
                if(1 == item)
                {
                    date_time = getdatetime(arr[item]);
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
                writelogtomysql();
            }
            finish_cnt++;
            
    }).on("error",function(err) {
            console.log("readCreatem error: " + err); 
    });
    })();
    }

}

function getfromjson(json, mysql_connection)
{
    DOWORK_T = json['DOWORK_T']*60;
    RESET_T = json['RESET_T']*60*60*1000 ;
    disk_used_level = json['disk_used_level'];
    DOCUMENT_ROOT_PATH = json['DOCUMENT_ROOT_PATH'];
    HISTORY_ROOT_PATH = json['HISTORY_ROOT_PATH'];
    LOG_ROOT_PATH = json['LOG_ROOT_PATH'];
    last_all_logfile_info = json['last_all_logfile_info'] ;
    lastResetTime = json['lastResetTime'];
    last_all_logfiles_info_path = HISTORY_ROOT_PATH + last_all_logfile_info;
    lastResetTimeFile = HISTORY_ROOT_PATH + json['lastResetTime'];

    database = json['database'] ;
    host = json['host'];
    port = json['port'];
    user = json['user'];
    password =json['password'];
    cdn_file_lfu_stats = json['cdn_file_lfu_stats'];
    cdn_file_records = json['cdn_file_records'];

    connection = mysql_connection;
}


function process(json, mysql_connection){
    getfromjson(json, mysql_connection);
    var cnt = 0;
    var logrecord = '{';
    //    console.log("fs.readdirSync(global.LOG_ROOT_PATH) start...... ");
    var files = fs.readdirSync(LOG_ROOT_PATH);
    var last_all_logfiles_info_exist = fs.existsSync(last_all_logfiles_info_path);
    console.log("last_all_logfiles_info_exist: " + last_all_logfiles_info_exist);
    for (var i = 0; i < files.length; i++)
    {
        var fstat =fs.statSync(LOG_ROOT_PATH + '/' + files[i]);
        if( fstat.isFile())
        {
            if( -1 != files[i].lastIndexOf("access.log"))
            {   
                if( cnt != 0)
                {   
                    logrecord += ',';
                }
                var json_item;
                if((true == last_all_logfiles_info_exist) &&  (json_item = fileExistinJson(LOG_ROOT_PATH + files[i])))
                {
                    logrecord +=  '"' + LOG_ROOT_PATH + files[i] + '": {"last_modify_time": "' + fstat.atime + '", "offset": ' +json_item.file_sizes +', "file_sizes": ' + fstat.size + '}';
                }
                else
                {   
                    //                    console.log("json_item = " + json_item);
                    logrecord += '"' + LOG_ROOT_PATH + files[i] + '": {"last_modify_time": "' + fstat.atime + '", "offset": 0'+', "file_sizes": ' + fstat.size +'}';
                }
                cnt ++; 
             }    
         } 

     }

            logrecord += '}';
            fs.writeFileSync(HISTORY_ROOT_PATH + "tmp.json", logrecord);
            if(fs.existsSync(last_all_logfiles_info_path))
            {
                fs.unlinkSync(last_all_logfiles_info_path);
            }
            fs.renameSync(HISTORY_ROOT_PATH + "tmp.json", last_all_logfiles_info_path);

            //        console.log(logrecord);
            console.log("fs.rnameSync(LOG_ROOT_PATH) end...... ");
            getfromlogs();
}

exports.process = process;
