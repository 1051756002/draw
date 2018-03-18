let service = {};
let CMD = require('./service-config')['Main_CMD_Question'];

service.sendMsg = function(cmd, data) {
	let exist = true;
	switch (cmd) {
		case 'choice':
			send_choice(data);
			break;
		case 'answer':
			send_answer(data);
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
		case CMD.Sub_CMD_S_Choice:
			recv_choice(bodyBuff);
			break;
		case CMD.Sub_CMD_S_Answer:
			recv_answer(bodyBuff);
			break;
		case CMD.Sub_CMD_P_GetQuestion:
			push_getquestion(bodyBuff);
			break;
		case CMD.Sub_CMD_P_Choice:
			push_choice(bodyBuff);
			break;
		case CMD.Sub_CMD_P_Answer:
			push_answer(bodyBuff);
			break;
		default:
			exist = false;
			break;
	}
	return exist;
};


// ############# 发送 #############

let send_choice = function(data) {
	let model = protobuf['C_Choice_Msg'];
	let example = model.create({
		roomid: ideal.data.room.roomid,
		questionid: data.questionid,
	});
	let bodyBuff = model.encode(example).finish();

	ideal.conn.sendMsg(CMD.Main, CMD.Sub_CMD_C_Choice, bodyBuff);
};

let send_answer = function(data) {
	let model = protobuf['C_Answer_Msg'];
	let example = model.create({
		roomid: data.roomid,
		questionid: data.questionid,
		answer: data.answer,
	});
	let bodyBuff = model.encode(example).finish();

	ideal.conn.sendMsg(CMD.Main, CMD.Sub_CMD_C_Answer, bodyBuff);
};


// ############# 接收 #############

let recv_choice = function(bodyBuff) {
	let model = protobuf['S_Choice_FbMsg'];
	let example = model.decode(bodyBuff);

	// 请求失败
	let result = example.result;
	if (result.code != 0) {
		util.showTips(result.errmsg);
		return;
	}

	ideal.conn.emit('choice.success', example);
};

let recv_answer = function(bodyBuff) {
	let model = protobuf['S_Answer_FbMsg'];
	let example = model.decode(bodyBuff);

	// 请求失败
	let result = example.result;
	if (result.code != 0) {
		util.showTips(result.errmsg);
		return;
	}

	ideal.conn.emit('answer.success', example);
};


// ############# 推送 #############

let push_getquestion = function(bodyBuff) {
	let model = protobuf['S_GetQuestion_Msg'];
	let example = model.decode(bodyBuff);

	ideal.conn.emit('push.getquestion', example);
};

let push_choice = function(bodyBuff) {
	let model = protobuf['S_Choice_Msg'];
	let example = model.decode(bodyBuff);

	ideal.conn.emit('push.choice', example);
};

let push_answer = function(bodyBuff) {
	let model = protobuf['S_Answer_Msg'];
	let example = model.decode(bodyBuff);

	util.log('push.answer', example);
	ideal.conn.emit('push.answer', example);
};

module.exports = service;
