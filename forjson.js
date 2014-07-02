
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
    var length = eval(obj2.log).length;
    for(var i=0; i < length; i ++)
    {
        if( file == obj2.log[i].log_file)
        {
            return obj2.log[i];
        }
    }
    return null;
}

exports.exist_json = exist_json;
