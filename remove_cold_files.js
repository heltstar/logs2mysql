
var sys = require('sys');
var fs = require('fs');

var ROOT_PATH = '/home/wangjian';
var file_path = "";
var date_time= "";

var DATABASE = 'cdn_db';
var TABLE = 'cdn_file_lfu_stats';
var CDN_FILE_RECORD = 'cdn_file_record';

var mysql      = require('mysql');
var connection = mysql.createConnection({
host     : '192.168.56.101',
port     : 3306,
user     : 'root',
password : 'wangjian',
database : 'cdn_db',
});
connection.connect();

/*
connection.query('SELECT * from ' + TABLE, function(err, rows, fields) {
        if (err) throw err;
        console.log("rows.length:"+rows.length);
        for(var i = 0; i < rows.length; i++)
        {   
        //console.log('The solution is: ', rows[i].id, rows[i].firstname,  rows[i].lastname, rows[i].message);
        console.log(rows[i]);
        }   
        }); 
*/


var file_path;
var file_path_record;
connection.query('SELECT * from ' + TABLE + ' where id = 1', function(err, rows, fields) {
        if (err) throw err;
        console.log("rows.length:"+rows.length);
        for(var i = 0; i < rows.length; i++)
        {   
//            console.log(rows[i]);
            file_path_record = rows[i].file_path;
            file_path = ROOT_PATH + rows[i].file_path;
            console.log(i + '---' + file_path_record);
            fs.unlink(file_path, function(err){
                if(err) console.log("remove file error");
                console.log("remove " + file_path + " success");
                connection.query('DELETE from ' + TABLE + ' where file_path="' + file_path_record +'"', function(err) {
                      if (err) throw err;
                      console.log("delete mysql record from " + TABLE + " where file_path=" + file_path_record + " success");
                      connection.query('DELETE from ' + CDN_FILE_RECORD + ' where file_path="' + file_path_record +'"', function(err) {
                            if (err) throw err;
                            console.log("delete mysql record from " + CDN_FILE_RECORD + " where file_path=" + file_path_record + " success");
                      });
                 }); 

            }); 
        }
}); 

//connection.end();
