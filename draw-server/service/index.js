/**
 * 业务服务器
 * 用于解读客户端发送过来的请求，分发出业务指令。
 */
let service = {
	// 源数据, 存放业务子体系
	_source: {},
};

// 基于socket.send扩展
service.send = function(mainCmd, subCmd, bodyBuff) {
	let lowerLen = config.cdf.lowerLen;
	let bufferLen = (bodyBuff ? bodyBuff.byteLength : 0) + lowerLen;
	let buffer = new ArrayBuffer(bufferLen);
	// 消息头
	new Uint16Array(buffer, 0, 1).set(config.cdf.head);
	// 消息命令
	new Uint16Array(buffer, 2, 2).set([mainCmd, subCmd]);
	// 消息内容
	if (bufferLen > lowerLen) {
		new Uint8Array(buffer, lowerLen).set(bodyBuff);
	}

	if (this.readyState != this.OPEN) {
		util.log('%-gray', '  The client has been disconnected, sending failure.');
		return;
	}

	this.send(buffer);
};

// 通知房间内的其他玩家
service.notice = function(roomid, mainCmd, subCmd, noticeData) {
	// 房间列表
	let roomlist = ideal.data.roomlist;
	// 房间内玩家列表
	let userlist = roomlist[roomid].userlist;
	// 自己的用户名/账号
	let username = this.user.username;

	// 通知此房间内每一位玩家
	let unames = Object.keys(userlist);

	for (let i in unames) {
		// 不通知自己
		if (unames[i] == username) { continue; }

		let cli = ideal.data.clientlist[unames[i]];
		service.sendMsg.call(cli, mainCmd, subCmd, noticeData);
	};
};

// 通知房间内的单个玩家
service.notice2 = function(username, mainCmd, subCmd, noticeData) {
	let cli = ideal.data.clientlist[username];
	service.sendMsg.call(cli, mainCmd, subCmd, noticeData);
};

// 发送指令
service.sendMsg = function(mainCmd, subCmd, data) {
	util.logat('%-gray', ' Send - Main: {1}, Sub: {2}', mainCmd, subCmd);

	let exist = false;
	for (let i in service._source) {
		// 不存在此API
		if (!service._source[i].sendMsg) {
			continue;
		}
		exist = service._source[i].sendMsg.call(this, mainCmd, subCmd, data);
		if (exist) { break; }
	}

	if (!exist) {
		util.warn('WARN: %s not sent.', type);
	}
};

// 解析消息
service.parseMsg = function(mainCmd, subCmd, bodyBuff) {
	util.logat('%-gray', ' Recv - Main: {1}, Sub: {2}', mainCmd, subCmd);

	let exist = false;
	for (let i in service._source) {
		// 不存在此API
		if (!service._source[i].parseMsg) {
			continue;
		}
		exist = service._source[i].parseMsg.call(this, mainCmd, subCmd, bodyBuff);
		if (exist) { break; }
	}

	if (!exist) {
		util.warn('WARN: { main: %d, sub: %d } not parsing.', mainCmd, subCmd);
	}
};

// 初始化业务服务器
service.init = function(callback) {
	let walk = require('walkdir');

	util.log('%-cyan', '  service loaded start.');
	// 遍历本目录下的所有子体系
	walk.sync('./service', function(path, stats) {
		// 非js文件过滤掉
		if (!/.*\.js$/.test(path)) {
			return;
		}

		let arr = [];
		// PC系统路径格式
		if (path.indexOf('\\') > -1) {
			arr = path.split('\\');
		}
		// 苹果系统路径格式
		else {
			arr = path.split('/');
		}

		arr = arr.splice(arr.lastIndexOf('service') + 1);

		// 重定义文件名, 且用来做业务键值
		let fname = arr.join('.');

		// 过滤掉非法格式的文件
		if (/^service-.*\.js$/.test(fname) == false) {
			return;
		}

		util.logat('%-gray', '  - loaded file: {1}', path);
		
		if (util.isEmpty(service._source[fname])) {
			service._source[fname] = require(path);
			util.logat('%-gray', '    define as {1}', fname);
		} else {
			util.logat('%-yellow', '  - define as {1}, but it has already existed', fname);
		}
	});
	util.log('%-cyan', '  service loaded complete.\n');

	util.isDefine(callback) && callback();
};

module.exports = service;
