var ejson  = require('./forjson.js');
var fs = require('fs');
var LOG_HISTORY = 'log_history.json';

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
                    logrecord += '{"log_file": "' + files[i] + '","last_modify_time": "' + fstat.atime + '", "offset": ' +json_item.offset+'}';
                }
                else
                {
                    logrecord += '{"log_file": "' + files[i] + '","last_modify_time": "' + fstat.atime + '", "offset": 0}';
                }
//                console.log(logrecord);
                cnt ++; 
            }    
        } 

    }

        logrecord += ']' +'}';
        fs.writeFileSync("tmp.json", logrecord);
        if(fs.existsSync(LOG_HISTORY))
        {
            fs.unlinkSync(LOG_HISTORY);
        }
        fs.renameSync("tmp.json", LOG_HISTORY);
}

    exports.init_json = explorer;
