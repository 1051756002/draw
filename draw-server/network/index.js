let network = {};

// 接收数据
let onReceive = function(uint8) {
	let client = this;

	if (uint8 instanceof Uint8Array == false) {
		util.log('Incorrect format.');
		return;
	}

	if (uint8.byteLength < config.cdf.lowerLen) {
		util.log('Incorrect format 2.');
		return;
	}

	let buffer = new ArrayBuffer(uint8.byteLength);
	new Uint8Array(buffer).set(uint8);

	let head = new Uint16Array(buffer, 0, 1);
	let cmds = new Uint16Array(buffer, 2, 2);
	let body = new Uint8Array(buffer, config.cdf.lowerLen);

	if (head[0] != config.cdf.head[0]) {
		util.log('Incorrect format 3.')
		return;
	}
	service.parseMsg.call(client, cmds[0], cmds[1], body);
};

// 连接中断
let onInterrupt = function() {
	let client = this;

	// 唯一自增值
	let inc = client.upgradeReq.incUid;

	// 未定义用户信息, 此用户还没有登录
	if (util.isEmpty(client.user)) {
		util.logat('%-gray', '  disconnect inc: {1} not logged in.', inc);
		return;
	}

	util.logat('%-gray', '  disconnect inc: {1}', inc);

	// 用户名/账号
	let username = client.user.username;
	// 房间列表
	let roomlist = ideal.data.roomlist;
	// 指令配置
	let CMD = require('../service/config')['Main_CMD_Room'];

	for (let i in roomlist) {
		let room = roomlist[i];

		// 不在此房间
		if (util.isEmpty(room.userlist[username])) {
			continue;
		}

		// 房间正空闲中, 直接退出房间
		if (room.status == 0) {
			delete room.userlist[username];

			let data = {
				roomid: room.roomid,
				userlist: ideal.data.getRoomUserList(room.roomid),
			};

			// 通知此房间内每一位玩家, 此号退出房间了
			let unames = Object.keys(room.userlist);

			for (let j in unames) {
				let cli = ideal.data.clientlist[unames[j]];
				service.sendMsg.call(cli, CMD.Main, CMD.Sub_CMD_S_Leave, data);
			};
		}
		// 房间正在进行中
		else if (room.status == 1) {
			// todo ...
		}
	};
};

// 通讯异常
let onError = function(err) {
	util.logat('%-red', '  Error: {1}', err);
};

// 通讯监听
let listen = function(client) {
	util.logat('%-gray', '  connect inc: {1}', client.upgradeReq.incUid);

	client.on('message', onReceive.bind(client));
	client.on('close', onInterrupt.bind(client));
	client.on('error', onError.bind(client));
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
