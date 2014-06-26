var ejson  = require('./forjson.js');
var fs = require('fs');
var global = require("./global.js");

function explorer(path){
    var cnt = 0;
    var logrecord = '{"log":[';
    var files = fs.readdirSync(path);

    for (var i = 0; i < files.length; i++)
    {
        var fstat =fs.statSync(path + '/' + files[i]);
        if( fstat.isFile())
        {
            if( -1 != files[i].lastIndexOf("access.log"))
            {   
//                console.log('文件名:' + path + '/' + files[i]);
                if( cnt != 0)
                {   
                    logrecord += ',';
                }
                var json_item;
                if( json_item = ejson.exist_json(files[i]))
                {
                    logrecord += '{"log_file": "' + files[i] + '","last_modify_time": "' + fstat.atime + '", "offset": ' +json_item.file_sizes +', "file_sizes": ' + fstat.size + '}';
                }
                else
                {
                    logrecord += '{"log_file": "' + files[i] + '","last_modify_time": "' + fstat.atime + '", "offset": 0'+', "file_sizes": ' + fstat.size +'}';
                }
//                console.log(logrecord);
                cnt ++; 


            }    
        } 

    }

        logrecord += ']' +'}';
        fs.writeFileSync("tmp.json", logrecord);
        if(fs.existsSync(global.log_history))
        {
            fs.unlinkSync(global.log_history);
        }
        fs.renameSync("tmp.json", global.log_history);
}

    exports.init_json = explorer;
