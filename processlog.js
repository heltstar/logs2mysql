var initjson  = require('./initjson.js');
var write2mysql = require('./write2mysql.js');
var getfromlogs = require('./getfromlogs.js');
var rmcoldfiles = require('./rmcoldfiles.js');
var async = require("async");
/*
//async.series([
async.waterfall([
    function(callback){
        initjson.init_json();
        console.log("one: 1");
        callback();
    },
    function(callback){
        getfromlogs.getfromlogs();

        console.log("two: 2");
        callback();
    },
    function(callback){
        write2mysql.write2mysql();

        console.log("three : 3");
        callback();
    },
    function(callback){
        rmcoldfiles.rmcoldfiles();

        console.log("four: 4");
        callback();
    }
],

    function(){
        console.log("end: ");
        return;
    }
);
*/

initjson.init_json();

setTimeout(getfromlogs.getfromlogs,1000);

//setTimeout(write2mysql.write2mysql,120000);
setTimeout(write2mysql.write2mysql,20000);

//setTimeout(rmcoldfiles.rmcoldfiles, 300000);
//setTimeout(rmcoldfiles.rmcoldfiles, 25000);
