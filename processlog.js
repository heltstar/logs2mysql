var  initjson  = require('./initjson.js'); 

function processlog() {
/*
    var initjson;
    try{
        delete require.cache[require.resolve("./initjson.js")];
        initjson  = require('./initjson.js'); 
    }
    catch(err)
    {
        console.log("processlog() error: " +err);
        path.exit(1);
    }
*/
    initjson.init_json();
}

exports.processlog = processlog;
