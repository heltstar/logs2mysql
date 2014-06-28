var processlog = require("./processlog.js");
var global = require("./global.js");
var DOWORK_T = global.DOWORK_T;

//processlog.processlog();

//setInterval(processlog.processlog, DOWORK_T);
setInterval(processlog.processlog, 2*60*60*1000);
