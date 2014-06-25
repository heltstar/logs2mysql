
function getdatetime(timestr)
{
//	console.log(timestr);
    var firstdot = timestr.indexOf(":");
    var firstnull = timestr.indexOf(" ");
    var time = timestr.substring(firstdot+1, firstnull);
//    console.log(time);

    var date = timestr.substring(0,firstdot);
//    console.log(date);
    var year = "", month = "", day = "";
    var item;
    arr = date.split("/");
    day = arr[0];
    month = arr[1];
    year = arr[2];

    var month_arr = {   
    "Jan":"01",
    "Feb":"02",
    "Mar":"03", 
    "Apr":"04", 
    "May":"05", 
    "Jun":"06",
    "Jul":"07", 
    "Aug":"08",
    "Sep":"09",
    "Oct":"10",
    "Nov":"11",
    "Dec":"12"
    };

    var str ;
    str = year + "-" + month_arr[month] + "-" + day + " " + time;
    return str;
}

exports.getdatetime = getdatetime;

//var tstr="29/May/2014:16:45:31 +0800";
//console.log(fun(tstr));