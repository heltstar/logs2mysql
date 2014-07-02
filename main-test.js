var processlog = require("./processlog.js");
var global = require("./global.js");
//var DOWORK_T = global.DOWORK_T;

//setInterval(processlog.processlog, DOWORK_T);
setInterval(processlog.processlog, 3*60*1000);
//processlog.processlog();
