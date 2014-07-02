var ejson  = require('./forjson.js');
var fs = require('fs');
var global = require("./global.js");
var getfromlogs = require('./getfromlogs.js');


var last_all_logfiles_info_path = global.HISTORY_ROOT_PATH + global.last_all_logfiles_info;

function explorer(){
    var cnt = 0;
    var logrecord = '{"log":[';
//    console.log("fs.readdirSync(global.LOG_ROOT_PATH) start...... ");
    var files = fs.readdirSync(global.LOG_ROOT_PATH);
    var last_all_logfiles_info_exist = fs.existsSync(last_all_logfiles_info_path);
    console.log("last_all_logfiles_info_exist: " + last_all_logfiles_info_exist);
    for (var i = 0; i < files.length; i++)
    {
        var fstat =fs.statSync(global.LOG_ROOT_PATH + '/' + files[i]);
        if( fstat.isFile())
        {
            if( -1 != files[i].lastIndexOf("access.log"))
            {   
                if( cnt != 0)
                {   
                    logrecord += ',';
                }
                var json_item;
                if((true == last_all_logfiles_info_exist) &&  (json_item = ejson.exist_json(global.LOG_ROOT_PATH + files[i])))
                {
                    logrecord += '{"log_file": "' + global.LOG_ROOT_PATH + files[i] + '","last_modify_time": "' + fstat.atime + '", "offset": ' +json_item.file_sizes +', "file_sizes": ' + fstat.size + '}';
                }
                else
                {   
//                    console.log("json_item = " + json_item);
                    logrecord += '{"log_file": "' + global.LOG_ROOT_PATH + files[i] + '","last_modify_time": "' + fstat.atime + '", "offset": 0'+', "file_sizes": ' + fstat.size +'}';
                }
                cnt ++; 
            }    
        } 

    }

        logrecord += ']' +'}';
        fs.writeFileSync(global.HISTORY_ROOT_PATH + "tmp.json", logrecord);
        if(fs.existsSync(last_all_logfiles_info_path))
        {
            fs.unlinkSync(last_all_logfiles_info_path);
        }
        fs.renameSync(global.HISTORY_ROOT_PATH + "tmp.json", last_all_logfiles_info_path);

//        console.log(logrecord);
        console.log("fs.rnameSync(global.LOG_ROOT_PATH) end...... ");
        getfromlogs.getfromlogs();
}

exports.init_json = explorer;
