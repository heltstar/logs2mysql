
var global = require("./global.js");
var last_all_logfiles_info_path = global.HISTORY_ROOT_PATH + global.last_all_logfiles_info;

function exist_json(file)
{
    var ob;
    try {
        delete require.cache[require.resolve(last_all_logfiles_info_path)];
        ob = require(last_all_logfiles_info_path);
    }
    catch(err)
    {
        console.log("exist_json() error: "+err);
        return null;
    }

    var str = JSON.stringify(ob);
    var obj2 = JSON.parse(str);
    if( null != obj2[file])
    {
       return obj2[file];
    }
    return null;
}

exports.exist_json = exist_json;
