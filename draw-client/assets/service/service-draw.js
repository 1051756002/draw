let service = {};
let CMD = require('./service-config')['Main_CMD_Draw'];

service.sendMsg = function(cmd, data) {
	let exist = true;
	switch (cmd) {
		case 'draw':
			send_draw(data);
			break;
		case 'clean':
			send_clean(data);
			break;
		case 'submit':
			send_submit(data);
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
		case CMD.Sub_CMD_S_Draw:
			recv_draw(bodyBuff);
			break;
		case CMD.Sub_CMD_S_Clean:
			recv_clean(bodyBuff);
			break;
		case CMD.Sub_CMD_S_Submit:
			recv_submit(bodyBuff);
			break;
		case CMD.Sub_CMD_P_Draw:
			push_draw(bodyBuff);
			break;
		case CMD.Sub_CMD_P_Clean:
			push_clean(bodyBuff);
			break;
		case CMD.Sub_CMD_P_Submit:
			push_submit(bodyBuff);
			break;
		default:
			exist = false;
			break;
	}
	return exist;
};


// ############# 发送 #############

let send_draw = function(data) {
	let model = protobuf['C_Draw_Msg'];
	let example = model.create({
		roomid: ideal.data.room.roomid,
		line: data.line,
	});
	let bodyBuff = model.encode(example).finish();

	util.log(example);
	util.log(data.line);
	
	ideal.conn.sendMsg(CMD.Main, CMD.Sub_CMD_C_Draw, bodyBuff);
};

let send_clean = function(data) {
	let model = protobuf['C_Clean_Msg'];
	let example = model.create({
		roomid: ideal.data.room.roomid,
	});
	let bodyBuff = model.encode(example).finish();

	ideal.conn.sendMsg(CMD.Main, CMD.Sub_CMD_C_Clean, bodyBuff);
};

let send_submit = function(data) {
	let model = protobuf['C_Submit_Msg'];
	let example = model.create({
		roomid: data.roomid,
		questionid: data.questionid,
		answer: data.answer,
	});
	let bodyBuff = model.encode(example).finish();

	ideal.conn.sendMsg(CMD.Main, CMD.Sub_CMD_C_Submit, bodyBuff);
};


// ############# 接收 #############

let recv_draw = function(bodyBuff) {
	let model = protobuf['S_Draw_FbMsg'];
	let example = model.decode(bodyBuff);

	ideal.conn.emit('draw.feedback', example);
};

let recv_clean = function(bodyBuff) {
	let model = protobuf['S_Clean_FbMsg'];
	let example = model.decode(bodyBuff);

	// 请求失败
	let result = example.result;
	if (result.code != 0) {
		util.showTips(result.errmsg);
		return;
	}

	ideal.conn.emit('clean.success', example);
};

let recv_submit = function(bodyBuff) {
	let model = protobuf['S_Submit_FbMsg'];
	let example = model.decode(bodyBuff);

	ideal.conn.emit('submit.feedback', example);
};


// ############# 推送 #############

let push_draw = function(bodyBuff) {
	let model = protobuf['S_Draw_Msg'];
	let example = model.decode(bodyBuff);

	ideal.conn.emit('push.draw', example);
};

let push_clean = function(bodyBuff) {
	let model = protobuf['S_Clean_Msg'];
	let example = model.decode(bodyBuff);

	ideal.conn.emit('push.clean', example);
};

let push_submit = function(bodyBuff) {
	let model = protobuf['S_Submit_Msg'];
	let example = model.decode(bodyBuff);

	ideal.conn.emit('push.submit', example);
};

module.exports = service;
