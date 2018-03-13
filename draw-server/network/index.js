let network = {};
let lowerLen = 6;
let __head = [1005];

// 通讯监听
let listen = function(client) {
	util.logat('%-gray', '  connect inc: {1}', client.upgradeReq.incUid);

	// 分发指令
	client.on('message', function(uint8) {
		if (uint8 instanceof Uint8Array == false) {
			util.log('Incorrect format.');
			return;
		}

		if (uint8.byteLength < lowerLen) {
			util.log('Incorrect format 2.');
			return;
		}

		let buffer = new ArrayBuffer(uint8.byteLength);
		new Uint8Array(buffer).set(uint8);

		let head = new Uint16Array(buffer, 0, 1);
		let cmds = new Uint16Array(buffer, 2, 2);
		let body = new Uint8Array(buffer, lowerLen);

		if (head[0] != __head[0]) {
			util.log('Incorrect format 3.')
			return;
		}
		service.parseMsg(cmds[0], cmds[1], body);
	});

	// 用户断线
	client.on('close', function() {
		util.logat('%-gray', '  disconnect inc: {1}', client.upgradeReq.incUid);
	});

	client.on('error', function(err) {
		util.logat('%-red', '  Error: {1}', err);
	});
};

// 初始化网络
network.init = function(callback) {
	let ws = require('ws');
	let server = require('http').createServer();

	let wss = new ws.Server({
		server: server,
		verifyClient: require('./verify'),
	});
	wss.on('connection', listen);

	util.log('%-green', '  ServerUrl: ws://%s:%d', config.server[1].address, config.server[1].port);

	server.allowHalfOpen = false;
	server.listen({
		port: config.server[1].port,
		host: config.server[1].address
	}, function() {
		util.log('%-green', '  Server is starting ...\n');
		util.isDefine(callback) && callback();
	});
};

module.exports = network;
