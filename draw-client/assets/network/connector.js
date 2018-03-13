let event = require('./event');
let service = require('../service/service');
let heartbeat = require('./heartbeat');

let SocketState = {
	Waiting: 0,			// 等待中
	Connecting: 1,		// 正在连接中
	Connected: 2,		// 已连接
	Disconnect: 3,		// 已断开
	Reconnecting: 4,	// 正在尝试重连
};

/**
 * 通讯器
 * 用于跟服务器创建一条通讯连接，时刻保持着连接状态。
 */
let connector = {
	socket: null,
	state: SocketState.Waiting,
};

// 重连次数
let reconn = 0;
// 重连
connector.reconnect = function() {
	reconn++;
	if (reconn > config.server[1].reconnLimit) {
		reconn = 0;
		this.error({
			msg: '与服务器断开了！',
		});
		return;
	}

	util.log(util.format('第{1}/{2}次尝试重连...', reconn, config.server[1].reconnLimit));
	this.state = SocketState.Connecting;
};

// 断开服务器
connector.interrupt = function(closeSocket) {
	this.state = SocketState.Disconnect;
	if (this.state != SocketState.Connected || this.socket.readyState != WebSocket.OPEN) {
		return false;
	}
	closeSocket(callback);
	return true;
};

// 异常处理
connector.error = function(err) {
	util.warn('conn error: %s', err.msg);
};

// 向服务器发送消息
connector.send = function(type, data) {
	service.sendMsg(type, data);
};

// 向服务器发送消息
connector.sendMsg = function(mainCmd, subCmd, bodyBuff = []) {
	let lowerLen = 6;
	let bufferLen = (bodyBuff ? bodyBuff.byteLength : 0) + lowerLen;
	let buffer = new ArrayBuffer(bufferLen);
	// 消息头
	new Uint16Array(buffer, 0, 1).set([1005]);
	// 消息命令
	new Uint16Array(buffer, 2, 2).set([mainCmd, subCmd]);
	// 消息内容
	if (bufferLen > lowerLen) {
		new Uint8Array(buffer, lowerLen).set(bodyBuff);
	}

	if (this.state != SocketState.Connected) {
		throw ({ msg: '与服务器连接中断' });
	}

	if (util.isEmpty(config.notlog_send) || config.notlog_send.indexOf(mainCmd) == -1) {
		util.log(util.format('%c发送: main={1}\tsub={2}\tbodyLen={3}', mainCmd, subCmd, bufferLen - lowerLen), 'color:#0fe029');
	}

	this.socket.send(buffer);
};

connector.emit = function(types, data) {
	if (!types) {
		return false;
	}

	let type_arr = [];
	if (typeof types == 'string') {
		type_arr = types.split(',');
	} else {
		type_arr = types.slice();
	}

	if (type_arr.length == 0) {
		return false;
	}

	type_arr.forEach(function(type) {
		event.triggerEvent(type, data);
	}, this);
	return true;
};

connector.on = function(types, selector, thisObj) {
	if (!types) {
		return false;
	}

	let type_arr = [];
	if (typeof types == 'string') {
		type_arr = types.split(',');
	} else {
		type_arr = types.slice();
	}

	if (type_arr.length == 0) {
		return false;
	}

	type_arr.forEach(function(type) {
		event.addEventListener(type, selector, thisObj);
	}, this);
	return true;
};

connector.off = function(types, selector) {
	if (!types) {
		return false;
	}

	let type_arr = [];
	if (typeof types == 'string') {
		type_arr = types.split(',');
	} else {
		type_arr = types.slice();
	}

	if (type_arr.length == 0) {
		return false;
	}

	type_arr.forEach(function(type) {
		event.removeEventListener(type, selector);
	}, this);
	return true;
};

let openSocket = function(serverUrl, onOpen, onClose, onError) {
	closeSocket(function() {
		try {
			let socket = connector.socket = new WebSocket(serverUrl);
			socket.binaryType = 'arraybuffer';
			socket.onopen = function(evt) {
				onOpen && onOpen(evt);
			};
			socket.onmessage = function(evt) {
				receiveMsg(evt.data);
			};
			socket.onclose = function(evt) {
				onClose && onClose(evt);
			};
			socket.onerror = function(evt) {
				onError && onError(evt);
			};
		} catch (err) {
			connector.error({
				msg: '开启Socket失败，或许该浏览器不支持WebSocket'
			});
		}
	});
};

let closeSocket = function(callback) {
	let socket = connector.socket;

	if (socket != null && socket.readyState != WebSocket.CLOSED) {
		if (callback) {
			let onClose = typeof socket.onclose == 'function' ? socket.onclose : null;
			socket.onclose = function() {
				onClose && onClose();
				callback();
			};
		}
		socket.close();
	} else {
		callback && callback();
	}
};

let receiveMsg = function(buffer) {
	try {
		if (!buffer instanceof ArrayBuffer) {
			return;
		}

		// 消息头部
		let msgHead = new Uint8Array(buffer, 0, 2);
		// 消息命令部分
		let msgCmd = new Uint16Array(buffer, 2, 4);
		// 消息参数
		let msgBody = new Uint8Array(buffer, 10);

		if (msgHead[0] != 6) {
			throw ({ msg: '包头验证失败' });
		}
		if (buffer.byteLength != msgCmd[0]) {
			throw ({ msg: '包长错误' });
		}

		let mainCmd = msgCmd[2];
		let subCmd = msgCmd[3];
		let bodyBuff = new Uint8Array(msgBody);

		if (config.notlog_recv.indexOf(mainCmd) == -1) {
			util.log(util.format('%c接收: main={1}, sub={2}, bodyLen={3}', mainCmd, subCmd, bodyBuff ? bodyBuff.byteLength : 0), 'color:#ea681c');
		}

		service.parseMsg(mainCmd, subCmd, bodyBuff);
	} catch (err) {
		if (connector.state != SocketState.CONNECTING) {
			connector.error({ msg: err.message });
		} else {
			throw(err);
		}
	}
};

// 初始化网络
connector.init = function(callback) {
	if (this.state != SocketState.Waiting) {
		util.warn('网络正在运作, 无需初始化.');
		util.isDefine(callback) && callback();
		return;
	}

	this.state = SocketState.Connecting;

	// 连接成功
	let openFn = function(ev) {
		this.state = SocketState.Connected;
		// this.send('login', ideal.param.platform);
		util.logat('%-#de590b', 'connect success.');
		util.isDefine(callback) && callback();
	}.bind(this);

	// 连接中断
	let closeFn = function(ev) {
		this.state = SocketState.Waiting;
		util.logat('%-#de590b', 'connect interrupt.');
		this.error({
			msg: '与服务器断开了！',
			callback: this.reconnect.bind(this)
		});
	}.bind(this);

	// 连接异常
	let errorFn = function(ev) {
		util.logat('%-#de590b', 'network error: ' + ev);
		this.error({
			msg: '连接异常！',
		});
	}.bind(this);

	let server = config.server[1];
	let surl = util.format('ws://{1}:{2}', server.address, server.port);
	util.logat('%-#de590b', 'connect server: {1}.', surl);

	openSocket(surl, openFn, closeFn, errorFn);
};

// 通讯状态赋到连接器中，方便外界用于判断
for (let i in SocketState) {
	connector[i] = SocketState[i];
};

module.exports = connector;
