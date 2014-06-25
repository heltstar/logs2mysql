var init_json  = require('./init_json.js');
var write2mysql = require('./write2mysql.js');
var rmcoldfiles = require('./rmcoldfiles.js');

var DATABASE = 'cdn_db';
var TABLE = 'cdn_file_lfu_stats';
var path =".";


init_json.init_json(path);

write2mysql.write2mysql();

rmcoldfiles.rmcoldfiles();
