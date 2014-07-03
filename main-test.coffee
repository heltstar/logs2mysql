colddata = require './colddata.js'

config = require '../config/config.coffee'

json = {}
json['DOWORK_T'] = config.cold_data.dowork_t;
json['RESET_T'] = config.cold_data.reset_t*60*60*1000
json['disk_used_level'] = config.cold_data.disk_used_level
json['DOCUMENT_ROOT_PATH'] = config.cold_data.document_root_path
json['HISTORY_ROOT_PATH'] =  config.cold_data.history_root_path
json['LOG_ROOT_PATH'] = config.cold_data.log_root_path
json['last_all_logfile_info'] = config.cold_data.last_all_logfile_info
json['lastResetTime'] = config.cold_data.lastResetTime

json['database'] = config.db.mysql.cdn.database
json['host'] = config.db.mysql.cdn.host
json['port'] = config.db.mysql.cdn.port
json['user'] = config.db.mysql.cdn.user
json['password'] = config.db.mysql.cdn.password
json['cdn_file_lfu_stats'] = config.cold_data.cdn_file_lfu_stats
json['cdn_file_records'] = config.cold_data.cdn_file_records

console.log "test coffee "

colddata.process json

#//setInterval(colddata.process, 3*60*1000);
