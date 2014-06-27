var ROOT_PATH = '/home/wangjian';
var LOGS_ROOT_PATH = './';
var log_history = './log_history.json';

var database = 'cdn_db';
var host= '192.168.56.101';
var port = 3306;
var user = 'root';
var password = 'wangjian';

var CDN_FILE_LFU_STATS = 'cdn_file_lfu_stats';
var CDN_FILE_RECORD = 'cdn_file_records';
var logs_stats = {};

var T = 8640; // 8640s = 1day

exports.ROOT_PATH = ROOT_PATH;
exports.LOGS_ROOT_PATH = LOGS_ROOT_PATH;
exports.log_history = log_history;

exports.database = database;
exports.host= host;
exports.port = port;
exports.user = user;
exports.password = password;

exports.CDN_FILE_LFU_STATS = CDN_FILE_LFU_STATS;
exports.CDN_FILE_RECORD = CDN_FILE_RECORD;

exports.logs_stats = logs_stats;

exports.T= T;
