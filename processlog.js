var init_json  = require('./init_json.js');
var write2mysql = require('./write2mysql.js');
var getfromlogs = require('./get_from_logs.js');
var rmcoldfiles = require('./rmcoldfiles.js');

var global = require("./global.js");
var path =".";


init_json.init_json(path);

setTimeout(getfromlogs.getfromlogs,1000);

setTimeout(write2mysql.write2mysql,2000);

setTimeout(rmcoldfiles.rmcoldfiles, 3000);
