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
		case CMD.Sub_CMD_P_Publish:
			push_publish.call(this, data);
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

		// 当前题库, 设置题目和开始时间
		room.topic.questionid = example.questionid;
		room.topic.starttime = Date.now();

		// ############ 通知房间内的其他玩家
		service.notice.call(this, roomid, CMD.Main, CMD.Sub_CMD_P_Choice, {
			roomid: roomid,
			question: question,
		});

		// ############ 游戏倒计时结束
		room.stid = setTimeout(function() {
			gameover_next.call(this, roomid);
		}.bind(this), config.gametime);
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
	// 出题人不可答题
	else if (topic.username == username) {
		data.result.code = 3;
		data.result.errmsg = '没有答题权限!';
	}
	// 本场精彩已结束, 提前一秒拒绝抢答
	else if (Date.now() >= topic.starttime + config.gametime - 1000) {
		data.result.code = 5;
		data.result.errmsg = '本场精彩已结束!';
	}
	else {
		// 题目
		let question = util.okey(ideal.data.questionlist, 'id', topic.questionid);
		
		// 回答正确
		if (example.answer == question.answer) {
			data.result.code = 0;
			// 加入已答对的列表
			topic.winner.push(username);
		}
		// 回答错误
		else {
			data.result.code = 4;
			data.result.errmsg = '回答错误!';
		}

		// 回答内容
		data.answer = example.answer;

		// ############ 通知房间内的其他玩家
		service.notice.call(this, roomid, CMD.Main, CMD.Sub_CMD_P_Answer, {
			roomid: roomid,
			username: username,
			answer: example.answer,
			correct: example.answer == question.answer ? 1 : 0,
		});

		// ############ 所有人都答对了, 本场游戏直接结束
		if (topic.winner.length >= util.olen(room.userlist) - 1) {
			gameover_next.call(this, roomid);
		}
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

let push_publish = function(data) {
	let model = protobuf['S_Publish_Msg'];
	let example = model.create(data);
	let bodyBuff = model.encode(example).finish();

	service.send.call(this, CMD.Main, CMD.Sub_CMD_P_Publish, bodyBuff);
};

// ############# 其他 #############

// 本场游戏结束, 继续下一场
let gameover_next = function(roomid) {
	// 房间信息
	let room = ideal.data.roomlist[roomid];
	// 当前题目
	let topic = room.topic;
	// 题目
	let question = util.okey(ideal.data.questionlist, 'id', topic.questionid);

	// 清除定时器
	clearTimeout(room.stid);

	// 推送的内容
	let data = {
		roomid: roomid,
		question: question,
	};
	let username = ideal.data.getTopicUser(roomid);

	// 找到下一位出题的用户
	if (username != null) {
		// 当前题库, 设置出题人
		room.topic.username = username;
		room.topic.winner = [];

		// 房间内的玩家列表
		data.userlist = ideal.data.getRoomUserList(roomid);
		// 标识为游戏未结束
		data.gameover = 0;

		// ############ 有序的给一名玩家推送题目

		// 延迟600ms, 避免场景切换慢
		setTimeout(function() {
			service.notice2(username, CMD.Main, CMD.Sub_CMD_P_GetQuestion, {
				roomid: roomid,
				questionlist: ideal.data.getRandomTopic(),
			});
		}, 600);
	}
	else {
		// 标识为游戏结束
		data.gameover = 1;
	}

	// 通知房间内的其他玩家
	service.notice.call(this, roomid, CMD.Main, CMD.Sub_CMD_P_Publish, data);

	// 通知自己
	service.sendMsg.call(this, CMD.Main, CMD.Sub_CMD_P_Publish, data);
};

module.exports = _service;
