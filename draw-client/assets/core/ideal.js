let ideal = {};

ideal.util = require('../util/util');
ideal.config = require('./config');
ideal.protobuf = require('./protobuf');
ideal.conn = require('../network/connector');
ideal.data = require('../data/data');

window.$ = require('jquery');
window.ideal = ideal;
window.util = ideal.util;
window.config = ideal.config;
window.protobuf = ideal.protobuf;

// 禁止引擎日志输出
window.console.timeEnd = function() {};

// 重定向, 获取本地IP地址
config.server.forEach(function(server) {
	server.address = '192.168.1.120';
});

// 初始化架构
ideal.init = function(callback) {
	config.clearlog && util.clear();
	// 加载protobuf
	protobuf.init(function() {
		// 初始化网络
		ideal.conn.init(function() {
			util.logat('%-#0fe029', 'Version: {1}', config.version);
			util.logat('%-#0fe029', 'DebugModel: {1}\n', config.debug);
			util.isDefine(callback) && callback();
		});
	});
};
