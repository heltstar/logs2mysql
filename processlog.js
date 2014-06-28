var initjson  = require('./initjson.js');
var write2mysql = require('./write2mysql.js');
var getfromlogs = require('./getfromlogs.js');
//var rmcoldfiles = require('./rmcoldfiles.js');

function processlog() {

initjson.init_json();

setTimeout(getfromlogs.getfromlogs,1000);

//setTimeout(write2mysql.write2mysql,120000);
setTimeout(write2mysql.write2mysql,20000);

//setTimeout(rmcoldfiles.rmcoldfiles, 25000);

}

//processlog();

exports.processlog = processlog;
