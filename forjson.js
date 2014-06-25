
var LOG_HISTORY = 'log_history.json';
function exist_json(file)
{
    var ob;
    try {
        ob = require("./"+LOG_HISTORY);
    }
    catch(err)
    {
        return null;
    }

    var str = JSON.stringify(ob);
    var obj2 = JSON.parse(str);
    var length = eval(obj2.log).length;
    for(var i=0; i < length; i ++)
    {
        //        console.log(obj2.log[i].log_file +":"+ obj2.log[i].last_modify_time +":"+obj2.log[i].offset);
        if( file == obj2.log[i].log_file)
        {
            return obj2.log[i];
        }
    }
    return null;
}

exports.exist_json = exist_json;
