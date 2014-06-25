var fs = require('fs');
var util = require('util');
//var PATH = '/usr/local/nginx-1.6.0/logs';
var PATH = './';
var LOG_HISTORY = 'log_history.json';
var logrecord = '{"logfiles":[';

function explorer(path){
    var cnt = 0;
    var files = fs.readdirSync(path);
    for (var i = 0; i < files.length; i++)
    {
        var fstat =fs.statSync(path + '/' + files[i]);
        if( fstat.isFile())
        {
            if( -1 != files[i].lastIndexOf("access.log"))
            {   
                console.log('文件名:' + path + '/' + files[i]);
                if( cnt != 0)
                {   
                    logrecord += ',';
                }   
                logrecord += '{"log_file": "' + files[i] + '","last_modify_time": "' + fstat.atime + '", "offset": ' +fstat.size+'}';
                console.log(logrecord);
                cnt ++; 
            }    
        } 

    }

        logrecord += ']' +'}';
        fs.writeFile(LOG_HISTORY, logrecord, function(err){
                if(err)throw err;
                console.log('write success');
                }); 
}

explorer(PATH);
