var processlog = require("./processlog.js");
var global = require("./global.js");
var fs = require("fs");
var moment = require("moment");

var RESET_T = global.RESET_T;
var lastResetTimeFile = global.HISTORY_ROOT_PATH + global.lastResetTime;
//console.log(moment().format('YYYY-MM-DD hh:mm:ss'));
function f(){
    console.log(Date());
//    setTimeout(w, 10);
//    setTimeout(r, 5034);
    r();
}

function w(){
fs.writeFile(lastResetTimeFile, (new Date()).getTime(), function(err){
    if(err) throw err;
    console.log("time set to " + lastResetTimeFile);
});
}

function r(){
fs.readFile(lastResetTimeFile, function(err, data){
    if(err) throw err;
    console.log("get time from " + lastResetTimeFile +': '+ data);
    var now = (new Date()).getTime();
    var difftime = now - parseInt(data) + RESET_T;

    console.log(now);
    console.log(parseInt(data));
    console.log(moment().unix());
    console.log(difftime);

    if(difftime >= RESET_T)
    {
        console.log(difftime + " >= " + RESET_T +": should reset the mysql");
        console.log("DELETE FROM " + global.CDN_FILE_LFU_STATS);
        w();
    }
    else
        console.log(difftime + " < " + RESET_T +": should not reset the mysql");
});
}
w();
setInterval(f, 2000);
//setTimeout(w, 10);
//setTimeout(r, 5034);
