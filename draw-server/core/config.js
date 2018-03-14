let config = {};

// 是否为开发模式
config.debug = true;
// 是否启动MongoDB
config.bootMongo = true;
// 客户端版本号
config.version = '0.0.1';
// 服务器配置
config.server = [
	// 登录服务器
	{
		// 地址
		address: '127.0.0.1',
		// 端口
		port: 3000,
	},
	// 游戏业务服务器
	{
		// 地址
		address: '127.0.0.1',
		// 端口
		port: 9411,
		// 重连次数上限
		reconnLimit: 5,
	}
];

// 不打印日志的接收命令
config.notlog_recv = [0];

// 不打印日志的接收命令
config.notlog_send = [0];

// proto文件列表
config.protolist = [
	'./proto/msg-socket.proto',
];

module.exports = config;
