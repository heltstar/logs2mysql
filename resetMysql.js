var global = require("./global.js");
var fs = require("fs");

var RESET_T = global.RESET_T;
var lastResetTimeFile = global.HISTORY_ROOT_PATH + global.lastResetTime;

function w(){
    fs.writeFile(lastResetTimeFile, (new Date()).getTime(), function(err){
            if(err) throw err;
                console.log("time set to " + lastResetTimeFile);
            });
}

function r(connection){
    fs.readFile(lastResetTimeFile, function(err, data){
            if(err) throw err;
            //console.log("get time from " + lastResetTimeFile +': '+ data);
            var now = (new Date()).getTime();
            var difftime = now - parseInt(data);

            //console.log(parseInt(data));
            //console.log(difftime);

            if(difftime >= RESET_T)
            {
                console.log(difftime + " >= " + RESET_T +": need to reset the mysql");
                console.log("DELETE FROM " + global.CDN_FILE_LFU_STATS);
                connection.query("DELETE FROM " + global.CDN_FILE_LFU_STATS, function(err){
                            if(err)throw err;
                            console.log("reset " + global.CDN_FILE_LFU_STATS + " success.");
                            connection.end();
                            process.exit(0);
                });
                w();
            }
            else
            {
                console.log(difftime + " < " + RESET_T +": need not to reset the mysql");
                connection.end();
                process.exit(0);
            }
    });
}

function f(connection){
    if(false == fs.existsSync(lastResetTimeFile))
    {
        w();
        console.log(lastResetTimeFile + "not exist, write date-time data to " + lastResetTimeFile + " and then return.");
        connection.end();
        process.exit(0);
    }
    r(connection);
}

exports.f = f;
exports.w = w;
exports.r = r;
