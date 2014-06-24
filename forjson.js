
var ob = require("./log_process_record.json");

var str = JSON.stringify(ob);
//console.log(str);

var obj2 = JSON.parse(str);
var length = eval(obj2.logfiles).length;
console.log("lenght="+ length);
for(var i=0; i < length; i ++)
{
    console.log(obj2["logfiles"][i].log_file +":"+ obj2["logfiles"][i].last_modify_time +":"+obj2["logfiles"][i].offset);
}
