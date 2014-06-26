var initjson  = require('./initjson.js');
var write2mysql = require('./write2mysql.js');
var getfromlogs = require('./getfromlogs.js');
var rmcoldfiles = require('./rmcoldfiles.js');

var global = require("./global.js");
var path =".";


initjson.init_json(path);

setTimeout(getfromlogs.getfromlogs,1000);

setTimeout(write2mysql.write2mysql,2000);

setTimeout(rmcoldfiles.rmcoldfiles, 3000);
