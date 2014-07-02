var DOCUMENT_ROOT_PATH = '/usr/local/nginx-1.6.0/html'; // xx.mp4 , xx.jpg ...
var LOG_ROOT_PATH = '/usr/local/nginx-1.6.0/logs/';     //access.log, xx-access.log ...
var HISTORY_ROOT_PATH = '/usr/local/nginx-1.6.0/logs/'; //lastResetTime.json ... 

var last_all_logfiles_info= 'lastAllLogfilesInfo.json';
var lastResetTime = "lastResetTime.json";

var database = 'cdn_db';
var host= '192.168.56.101';
var port = 3306;
var user = 'root';
var password = 'wangjian';

var CDN_FILE_LFU_STATS = 'cdn_file_lfu_stats';
var CDN_FILE_RECORD = 'cdn_file_records';

var logs_stats = {};
var disk_used_now = 0;
var disk_used_level = 85;

var RESET_T = 7*24*60*60*1000; // 1 week
//var RESET_T = 60*1000; 
//var DOWORK_T = 1*24*60*60;     // 1 day
var DOWORK_T = 7*60;     

exports.DOCUMENT_ROOT_PATH = DOCUMENT_ROOT_PATH;
exports.HISTORY_ROOT_PATH = HISTORY_ROOT_PATH;
exports.LOG_ROOT_PATH = LOG_ROOT_PATH;

exports.last_all_logfiles_info = last_all_logfiles_info;
exports.lastResetTime = lastResetTime;

exports.database = database;
exports.host= host;
exports.port = port;
exports.user = user;
exports.password = password;

exports.CDN_FILE_LFU_STATS = CDN_FILE_LFU_STATS;
exports.CDN_FILE_RECORD = CDN_FILE_RECORD;

exports.logs_stats = logs_stats;
exports.disk_used_now = disk_used_now;
exports.disk_used_level = disk_used_level;

exports.RESET_T= RESET_T;
exports.DOWORK_T= DOWORK_T;
