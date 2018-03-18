let _service = {};
let CMD = require('./config')['Main_CMD_Question'];

_service.sendMsg = function(mainCmd, subCmd, data) {
	if (CMD.Main != mainCmd) {
		return false;
	}

	let exist = true;
	switch (subCmd) {
		case CMD.Sub_CMD_P_GetQuestion:
			push_getquestion.call(this, data);
			break;
		case CMD.Sub_CMD_S_Choice:
			send_choice.call(this, data);
			break;
		case CMD.Sub_CMD_S_Answer:
			send_answer.call(this, data);
			break;
		case CMD.Sub_CMD_P_Answer:
			push_answer.call(this, data);
			break;
		case CMD.Sub_CMD_P_Choice:
			push_choice.call(this, data);
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
		case CMD.Sub_CMD_C_Choice:
			recv_choice.call(this, bodyBuff);
			break;
		case CMD.Sub_CMD_C_Answer:
			recv_answer.call(this, bodyBuff);
			break;
		default:
			exist = false;
			break;
	}
	return exist;
};


// ############# 发送 #############

let send_choice = function(data) {
	let model = protobuf['S_Choice_FbMsg'];
	let example = model.create(data);
	let bodyBuff = model.encode(example).finish();

	service.send.call(this, CMD.Main, CMD.Sub_CMD_S_Choice, bodyBuff);
};

let send_answer = function(data) {
	let model = protobuf['S_Answer_FbMsg'];
	let example = model.create(data);
	let bodyBuff = model.encode(example).finish();

	service.send.call(this, CMD.Main, CMD.Sub_CMD_S_Answer, bodyBuff);
};


// ############# 接收 #############

let recv_choice = function(bodyBuff) {
	let model = protobuf['C_Choice_Msg'];
	let example = model.decode(bodyBuff);

	// 房间ID
	let roomid = example.roomid;
	// 房间信息
	let room = ideal.data.roomlist[roomid];
	// 当前用户名
	let username = this.user.username;
	// 题目
	let question = util.okey(ideal.data.questionlist, 'id', example.questionid);

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
		data.result.errmsg = '没有出题权限!';
	}
	else {
		// 选题成功
		data.result.code = 0;
		data.roomid = roomid;
		data.question = question;

		// 当前题库, 设置题目
		room.topic.questionid = example.questionid;

		// ############ 通知房间内的其他玩家
		service.notice.call(this, roomid, CMD.Main, CMD.Sub_CMD_P_Choice, {
			roomid: roomid,
			question: question,
		});
	}

	service.sendMsg.call(this, CMD.Main, CMD.Sub_CMD_S_Choice, data);
};

let recv_answer = function(bodyBuff) {
	let model = protobuf['C_Answer_Msg'];
	let example = model.decode(bodyBuff);

	// 房间ID
	let roomid = example.roomid;
	// 房间信息
	let room = ideal.data.roomlist[roomid];
	// 当前用户名
	let username = this.user.username;
	// 题目
	let question = util.okey(ideal.data.questionlist, 'id', example.questionid);

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
	// 出题人不可答题
	else if (room.topic.username == username) {
		data.result.code = 3;
		data.result.errmsg = '没有答题权限!';
	}
	else {
		// 回答正确
		if (example.answer == question.answer) {
			data.result.code = 0;
		}
		// 回答错误
		else {
			data.result.code = 4;
			data.result.errmsg = '回答错误!';
		}

		// ############ 通知房间内的其他玩家
		service.notice.call(this, roomid, CMD.Main, CMD.Sub_CMD_P_Answer, {
			roomid: roomid,
			username: username,
			answer: example.answer,
			correct: example.answer == question.answer ? 1 : 0,
		});
	}

	service.sendMsg.call(this, CMD.Main, CMD.Sub_CMD_S_Answer, data);
};


// ############# 推送 #############

let push_getquestion = function(data) {
	let model = protobuf['S_GetQuestion_Msg'];
	let example = model.create(data);
	let bodyBuff = model.encode(example).finish();

	service.send.call(this, CMD.Main, CMD.Sub_CMD_P_GetQuestion, bodyBuff);
};

let push_choice = function(data) {
	let model = protobuf['S_Choice_Msg'];
	let example = model.create(data);
	let bodyBuff = model.encode(example).finish();

	service.send.call(this, CMD.Main, CMD.Sub_CMD_P_Choice, bodyBuff);
};

let push_answer = function(data) {
	let model = protobuf['S_Answer_Msg'];
	let example = model.create(data);
	let bodyBuff = model.encode(example).finish();

	service.send.call(this, CMD.Main, CMD.Sub_CMD_P_Answer, bodyBuff);
};

module.exports = _service;
