let _service = {};
let CMD = require('./config')['Main_CMD_Draw'];

_service.sendMsg = function(mainCmd, subCmd, data) {
	if (CMD.Main != mainCmd) {
		return false;
	}

	let exist = true;
	switch (subCmd) {
		case CMD.Sub_CMD_S_Draw:
			send_draw.call(this, data);
			break;
		case CMD.Sub_CMD_S_Clean:
			send_clean.call(this, data);
			break;
		case CMD.Sub_CMD_S_Submit:
			send_submit.call(this, data);
			break;
		case CMD.Sub_CMD_P_Draw:
			push_draw.call(this, data);
			break;
		case CMD.Sub_CMD_P_Clean:
			push_clean.call(this, data);
			break;
		case CMD.Sub_CMD_P_Submit:
			push_submit.call(this, data);
			break;
		default:
			exist = false;
			break;
	}
	return exist;
};

_service.parseMsg = function(mainCmd, subCmd, bodyBuff) {
	if (CMD.Main != mainCmd) {
		return false;
	}

	let exist = true;
	switch (subCmd) {
		case CMD.Sub_CMD_C_Draw:
			recv_draw.call(this, bodyBuff);
			break;
		case CMD.Sub_CMD_C_Clean:
			recv_clean.call(this, bodyBuff);
			break;
		case CMD.Sub_CMD_C_Submit:
			recv_submit.call(this, bodyBuff);
			break;
		default:
			exist = false;
			break;
	}
	return exist;
};


// ############# 发送 #############

let send_draw = function(data) {
	let model = protobuf['S_Draw_FbMsg'];
	let example = model.create(data);
	let bodyBuff = model.encode(example).finish();

	service.send.call(this, CMD.Main, CMD.Sub_CMD_S_Draw, bodyBuff);
};

let send_clean = function(data) {
	let model = protobuf['S_Clean_FbMsg'];
	let example = model.create(data);
	let bodyBuff = model.encode(example).finish();

	service.send.call(this, CMD.Main, CMD.Sub_CMD_S_Clean, bodyBuff);
};

let send_submit = function(data) {
	let model = protobuf['S_Submit_FbMsg'];
	let example = model.create(data);
	let bodyBuff = model.encode(example).finish();

	service.send.call(this, CMD.Main, CMD.Sub_CMD_S_Submit, bodyBuff);
};


// ############# 接收 #############

let recv_draw = function(bodyBuff) {
	let model = protobuf['C_Draw_Msg'];
	let example = model.decode(bodyBuff);

	// 房间ID
	let roomid = example.roomid;
	// 房间信息
	let room = ideal.data.roomlist[roomid];
	// 当前用户名
	let username = this.user.username;
	// 当前题目
	let topic = room.topic;

	let data = { result: {}, roomid: roomid };

	// 房间不存在
	if (util.isEmpty(room)) {
		data.result.code = 1;
		data.result.errmsg = '房间不存在!';
	}
	// 房间未开始游戏
	else if (room.status != 1) {
		data.result.code = 2;
		data.result.errmsg = '房间未开始游戏!';
	}
	// 非出题人
	else if (topic.username != username) {
		data.result.code = 3;
		data.result.errmsg = '没有权限!';
	}
	// 本场精彩已结束, 提前一秒拒绝抢答
	else if (Date.now() >= topic.starttime + config.gametime - 1000) {
		data.result.code = 5;
		data.result.errmsg = '本场精彩已结束!';
	}
	else {
		data.result.code = 0;

		// ############ 通知房间内的其他玩家
		service.notice.call(this, roomid, CMD.Main, CMD.Sub_CMD_P_Draw, {
			roomid: roomid,
			line: example.line,
		});
	}

	service.sendMsg.call(this, CMD.Main, CMD.Sub_CMD_S_Draw, data);
};

let recv_clean = function(bodyBuff) {
	let model = protobuf['C_Clean_Msg'];
	let example = model.decode(bodyBuff);

	// 房间ID
	let roomid = example.roomid;
	// 房间信息
	let room = ideal.data.roomlist[roomid];
	// 当前用户名
	let username = this.user.username;

	let data = { result: {}, roomid: roomid };

	// 房间不存在
	if (util.isEmpty(room)) {
		data.result.code = 1;
		data.result.errmsg = '房间不存在!';
	}
	// 房间未开始游戏
	else if (room.status != 1) {
		data.result.code = 2;
		data.result.errmsg = '房间未开始游戏!';
	}
	// 非出题人
	else if (room.topic.username != username) {
		data.result.code = 3;
		data.result.errmsg = '没有权限!';
	}
	else {
		data.result.code = 0;

		// ############ 通知房间内的其他玩家
		service.notice.call(this, roomid, CMD.Main, CMD.Sub_CMD_P_Clean, {
			roomid: roomid,
		});
	}

	service.sendMsg.call(this, CMD.Main, CMD.Sub_CMD_S_Clean, data);
};

let recv_submit = function(bodyBuff) {
	let model = protobuf['C_Submit_Msg'];
	let example = model.decode(bodyBuff);

	// 房间ID
	let roomid = example.roomid;
	// 房间信息
	let room = ideal.data.roomlist[roomid];
	// 当前用户名
	let username = this.user.username;

	let data = { result: {}, roomid: roomid };

	// 房间不存在
	if (util.isEmpty(room)) {
		data.result.code = 1;
		data.result.errmsg = '房间不存在!';
	}
	// 房间未开始游戏
	else if (room.status != 1) {
		data.result.code = 2;
		data.result.errmsg = '房间未开始游戏!';
	}
	// 非出题人
	else if (room.topic.username != username) {
		data.result.code = 3;
		data.result.errmsg = '没有权限!';
	}
	else {
		data.result.code = 0;

		// ############ 通知房间内的其他玩家
		service.notice.call(this, roomid, CMD.Main, CMD.Sub_CMD_P_Submit, {
			roomid: roomid,
		});
	}

	service.sendMsg.call(this, CMD.Main, CMD.Sub_CMD_S_Submit, data);
};


// ############# 推送 #############

let push_draw = function(data) {
	let model = protobuf['S_Draw_Msg'];
	let example = model.create(data);
	let bodyBuff = model.encode(example).finish();

	service.send.call(this, CMD.Main, CMD.Sub_CMD_P_Draw, bodyBuff);
};

let push_clean = function(data) {
	let model = protobuf['S_Clean_Msg'];
	let example = model.create(data);
	let bodyBuff = model.encode(example).finish();

	service.send.call(this, CMD.Main, CMD.Sub_CMD_P_Clean, bodyBuff);
};

let push_submit = function(data) {
	let model = protobuf['S_Submit_Msg'];
	let example = model.create(data);
	let bodyBuff = model.encode(example).finish();

	service.send.call(this, CMD.Main, CMD.Sub_CMD_P_Submit, bodyBuff);
};

module.exports = _service;
