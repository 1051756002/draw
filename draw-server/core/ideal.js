let ideal = {};

ideal.util = require('../util');
ideal.config = require('./config');
ideal.protobuf = require('./protobuf');
ideal.db = require('../network/db');
ideal.network = require('../network');
ideal.service = require('../service');
ideal.data = require('../data');

// 定义全局命名空间
global.ideal = ideal;
global.util = ideal.util;
global.config = ideal.config;
global.protobuf = ideal.protobuf;
global.network = ideal.network;
global.service = ideal.service;

// 重定向, 获取本地IP地址
config.server.forEach(function(server) {
	server.address = util.getIp();
});

// 初始化架构
ideal.init = function(callback) {
	util.clear();
	// 加载protobuf
	protobuf.init(function() {
		// 初始化业务服务器
		service.init(function() {
			if (config.bootMongo) {
				// 启动数据管理
				ideal.db.init(function() {
					// 启动服务器
					network.init(function() {
						util.logat('%-green', '  Version: {1}', config.version);
						util.logat('%-green', '  DebugModel: {1}\n', config.debug);
						util.isDefine(callback) && callback();
					});
				});
			} else {
				// 启动服务器
				network.init(function() {
					util.logat('%-green', '  Version: {1}', config.version);
					util.logat('%-green', '  DebugModel: {1}\n', config.debug);
					util.isDefine(callback) && callback();
				});
			}
		});
	});
};
