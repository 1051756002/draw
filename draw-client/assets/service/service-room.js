let service = {};
let CMD = require('./service-config')['Main_CMD_Room'];

service.sendMsg = function(cmd, data) {
	let exist = true;
	switch (cmd) {
		case 'match':
			send_match(data);
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
		case CMD.Sub_CMD_S_Leave:
			push_leave(bodyBuff);
			break;
		case CMD.Sub_CMD_S_Join:
			push_join(bodyBuff);
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


// ############# 接收 #############

let recv_match = function(bodyBuff) {
	let model = protobuf['S_Match_FbMsg'];
	let example = model.decode(bodyBuff);

	// 匹配失败
	let result = example.result;
	if (result.code != 0) {
		util.log(result);
		return;
	}

	ideal.conn.emit('match.success', example);
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

module.exports = service;
