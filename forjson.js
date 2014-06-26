
var global = require("./global.js");

function exist_json(file)
{
    var ob;
    try {
        ob = require(global.log_history);
    }
    catch(err)
    {
        console.log("exist_json():  "+global.log_history+" is not exist:"+err);
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
