let service = {};
let CMD = require('./service-config')['Main_CMD_Room'];

service.sendMsg = function(cmd, data) {
	let exist = true;
	switch (cmd) {
		case 'match':
			send_match(data);
			break;
		case 'play':
			send_play(data);
			break;
		case 'ready':
			send_ready(data);
			break;
		case 'unready':
			send_unready(data);
			break;
		default:
			exist = false;
			break;
	}
	return exist;
};

service.parseMsg = function(mainCmd, subCmd, bodyBuff) {
	if (CMD.Main != mainCmd) {
		return false;
	}

	let exist = true;
	switch (subCmd) {
		case CMD.Sub_CMD_S_Match:
			recv_match(bodyBuff);
			break;
		case CMD.Sub_CMD_S_Play:
			recv_play(bodyBuff);
			break;
		case CMD.Sub_CMD_S_Ready:
			recv_ready(bodyBuff);
			break;
		case CMD.Sub_CMD_S_UnReady:
			recv_unready(bodyBuff);
			break;
		case CMD.Sub_CMD_P_Leave:
			push_leave(bodyBuff);
			break;
		case CMD.Sub_CMD_P_Join:
			push_join(bodyBuff);
			break;
		case CMD.Sub_CMD_P_Ready:
			push_ready(bodyBuff);
			break;
		case CMD.Sub_CMD_P_UnReady:
			push_unready(bodyBuff);
			break;
		case CMD.Sub_CMD_P_Play:
			push_play(bodyBuff);
			break;
		default:
			exist = false;
			break;
	}
	return exist;
};


// ############# 发送 #############

let send_match = function(data) {
	let model = protobuf['C_Match_Msg'];
	let example = model.create({ });
	let bodyBuff = model.encode(example).finish();

	ideal.conn.sendMsg(CMD.Main, CMD.Sub_CMD_C_Match, bodyBuff);
};

let send_ready = function(data) {
	let model = protobuf['C_RoomReady_Msg'];
	let example = model.create({
		roomid: ideal.data.room.roomid,
	});
	let bodyBuff = model.encode(example).finish();

	ideal.conn.sendMsg(CMD.Main, CMD.Sub_CMD_C_Ready, bodyBuff);
};

let send_unready = function(data) {
	let model = protobuf['C_RoomUnReady_Msg'];
	let example = model.create({
		roomid: ideal.data.room.roomid,
	});
	let bodyBuff = model.encode(example).finish();

	ideal.conn.sendMsg(CMD.Main, CMD.Sub_CMD_C_UnReady, bodyBuff);
};

let send_play = function(data) {
	let model = protobuf['C_RoomPlay_Msg'];
	let example = model.create({
		roomid: ideal.data.room.roomid,
	});
	let bodyBuff = model.encode(example).finish();

	ideal.conn.sendMsg(CMD.Main, CMD.Sub_CMD_C_Play, bodyBuff);
};


// ############# 接收 #############

let recv_match = function(bodyBuff) {
	let model = protobuf['S_Match_FbMsg'];
	let example = model.decode(bodyBuff);

	// 请求失败
	let result = example.result;
	if (result.code != 0) {
		util.log(result);
		return;
	}

	ideal.conn.emit('match.success', example);
};

let recv_ready = function(bodyBuff) {
	let model = protobuf['S_RoomReady_FbMsg'];
	let example = model.decode(bodyBuff);

	ideal.conn.emit('ready.feedback', example);
};

let recv_unready = function(bodyBuff) {
	let model = protobuf['S_RoomUnReady_FbMsg'];
	let example = model.decode(bodyBuff);

	ideal.conn.emit('unready.feedback', example);
};

let recv_play = function(bodyBuff) {
	let model = protobuf['S_RoomPlay_FbMsg'];
	let example = model.decode(bodyBuff);

	// 更新房间用户列表
	ideal.data.room.userlist = example.userlist;

	ideal.conn.emit('play.feedback', example);
};


// ############# 推送 #############

let push_leave = function(bodyBuff) {
	let model = protobuf['S_LeaveRoom_Msg'];
	let example = model.decode(bodyBuff);

	ideal.conn.emit('push.leave_room', example);
};

let push_join = function(bodyBuff) {
	let model = protobuf['S_JoinRoom_Msg'];
	let example = model.decode(bodyBuff);

	ideal.conn.emit('push.join_room', example);
};

let push_ready = function(bodyBuff) {
	let model = protobuf['S_RoomReady_Msg'];
	let example = model.decode(bodyBuff);

	ideal.conn.emit('push.ready', example);
};

let push_unready = function(bodyBuff) {
	let model = protobuf['S_RoomUnReady_Msg'];
	let example = model.decode(bodyBuff);

	ideal.conn.emit('push.unready', example);
};

let push_play = function(bodyBuff) {
	let model = protobuf['S_RoomPlay_Msg'];
	let example = model.decode(bodyBuff);

	ideal.conn.emit('push.play', example);
};

module.exports = service;
