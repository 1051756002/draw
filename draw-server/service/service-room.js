let _service = {};
let CMD = require('./config')['Main_CMD_Room'];

_service.sendMsg = function(mainCmd, subCmd, data) {
	if (CMD.Main != mainCmd) {
		return false;
	}

	let exist = true;
	switch (subCmd) {
		case CMD.Sub_CMD_S_Match:
			send_match.call(this, data);
			break;
		case CMD.Sub_CMD_S_Ready:
			send_ready.call(this, data);
			break;
		case CMD.Sub_CMD_S_UnReady:
			send_unready.call(this, data);
			break;
		case CMD.Sub_CMD_S_Play:
			send_play.call(this, data);
			break;
		case CMD.Sub_CMD_P_Leave:
			push_leave.call(this, data);
			break;
		case CMD.Sub_CMD_P_Join:
			push_join.call(this, data);
			break;
		case CMD.Sub_CMD_P_Ready:
			push_ready.call(this, data);
			break;
		case CMD.Sub_CMD_P_UnReady:
			push_unready.call(this, data);
			break;
		case CMD.Sub_CMD_P_Play:
			push_play.call(this, data);
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
		case CMD.Sub_CMD_C_Match:
			recv_match.call(this, bodyBuff);
			break;
		case CMD.Sub_CMD_C_Ready:
			recv_ready.call(this, bodyBuff);
			break;
		case CMD.Sub_CMD_C_UnReady:
			recv_unready.call(this, bodyBuff);
			break;
		case CMD.Sub_CMD_C_Play:
			recv_play.call(this, bodyBuff);
			break;
		default:
			exist = false;
			break;
	}
	return exist;
};


// ############# 发送 #############

let send_match = function(data) {
	let model = protobuf['S_Match_FbMsg'];
	let example = model.create(data);
	let bodyBuff = model.encode(example).finish();

	service.send.call(this, CMD.Main, CMD.Sub_CMD_S_Match, bodyBuff);
};

let send_ready = function(data) {
	let model = protobuf['S_RoomReady_FbMsg'];
	let example = model.create(data);
	let bodyBuff = model.encode(example).finish();

	service.send.call(this, CMD.Main, CMD.Sub_CMD_S_Ready, bodyBuff);
};

let send_unready = function(data) {
	let model = protobuf['S_RoomUnReady_FbMsg'];
	let example = model.create(data);
	let bodyBuff = model.encode(example).finish();

	service.send.call(this, CMD.Main, CMD.Sub_CMD_S_UnReady, bodyBuff);
};

let send_play = function(data) {
	let model = protobuf['S_RoomPlay_FbMsg'];
	let example = model.create(data);
	let bodyBuff = model.encode(example).finish();

	service.send.call(this, CMD.Main, CMD.Sub_CMD_S_Play, bodyBuff);
};


// ############# 接收 #############

let recv_match = function(bodyBuff) {
	let model = protobuf['C_Match_Msg'];
	let example = model.decode(bodyBuff);

	let data = { result: {} };

	let roomlist = ideal.data.roomlist;

	/* roomlist[idx] => 
		'%roomid%': {
			roomid: '%roomid%',
			status: '0.空闲 1.进行中',
			hist: ['%username%'],  历史记录, 记录出过题的账号
			topic: {
				questionid: '问题ID',
				username: %username%,
			},
			userlist: {
				'%username%': {
					identity: '0.成员 1.房主',
					status: '0.未准备 1.已准备',
				}
			}
		}
	*/

	// 可加入的房间ID
	let roomid = 0;
	// 用户名/账号
	let username = this.user.username;
	for (let i in roomlist) {
		let room = roomlist[i];

		// 非空闲状态
		if (room.status != 0) {
			continue;
		}

		// 一个房间最多容纳3人
		let uids = util.olen(room.userlist);
		if (uids.length >= 3) {
			continue;
		}

		roomid = room.roomid;
		break;
	};

	if (roomid == 0) {
		// 没有可加入的房间ID, 则新开一个房间
		roomid = ++ideal.data.source.room.inc;
		roomlist[roomid] = {
			roomid: roomid,
			status: 0,
			hist: [],
			topic: {},
			userlist: {}
		};
		// 加入此房间, 房主; 默认为已准备
		roomlist[roomid].userlist[username] = { identity: 1, status: 1 };
	} else {
		// 加入此房间, 成员; 默认为已准备
		roomlist[roomid].userlist[username] = { identity: 0, status: 1 };
	}

	// 匹配成功
	data.result.code = 0;
	data.roomid = roomid;
	data.userlist = ideal.data.getRoomUserList(roomid);

	service.sendMsg.call(this, CMD.Main, CMD.Sub_CMD_S_Match, data);

	// ############ 通知房间内的其他玩家
	service.notice.call(this, roomid, CMD.Main, CMD.Sub_CMD_P_Join, {
		roomid: roomid,
		userlist: ideal.data.getRoomUserList(roomid),
	});
};

let recv_ready = function(bodyBuff) {
	let model = protobuf['C_RoomReady_Msg'];
	let example = model.decode(bodyBuff);

	// 房间ID
	let roomid = example.roomid;
	// 房间信息
	let room = ideal.data.roomlist[roomid];
	// 房间内用户信息
	let ruser = null;
	if (util.isDefine(room)) {
		ruser = room.userlist[this.user.username];
	}

	let data = { result: {}, roomid: roomid };

	// 房间不存在
	if (util.isEmpty(room) || util.isEmpty(ruser)) {
		data.result.code = 1;
		data.result.errmsg = '房间不存在!';
	}
	// 非空闲状态
	else if (room.status != 0) {
		data.result.code = 2;
		data.result.errmsg = '房间非空闲状态!';
	}
	// 房主无法准备
	else if (ruser.identity == 1) {
		data.result.code = 3;
		data.result.errmsg = '房主无法准备!';
	}
	else {
		// 准备
		data.result.code = 0;
		ruser.status = 1;

		// ############ 通知房间内的其他玩家
		service.notice.call(this, roomid, CMD.Main, CMD.Sub_CMD_P_Ready, {
			roomid: roomid,
			userlist: ideal.data.getRoomUserList(roomid),
		});
	}

	service.sendMsg.call(this, CMD.Main, CMD.Sub_CMD_S_Ready, data);
};

let recv_unready = function(bodyBuff) {
	let model = protobuf['C_RoomUnReady_Msg'];
	let example = model.decode(bodyBuff);

	// 房间ID
	let roomid = example.roomid;
	// 房间信息
	let room = ideal.data.roomlist[roomid];
	// 房间内用户信息
	let ruser = null;
	if (util.isDefine(room)) {
		ruser = room.userlist[this.user.username];
	}

	let data = { result: {}, roomid: roomid };

	// 房间不存在
	if (util.isEmpty(room) || util.isEmpty(ruser)) {
		data.result.code = 1;
		data.result.errmsg = '房间不存在!';
	}
	// 非空闲状态
	else if (room.status != 0) {
		data.result.code = 2;
		data.result.errmsg = '房间非空闲状态!';
	}
	// 房主无法准备
	else if (ruser.identity == 1) {
		data.result.code = 3;
		data.result.errmsg = '房主无法准备!';
	}
	else {
		// 取消准备
		data.result.code = 0;
		ruser.status = 0;

		// ############ 通知房间内的其他玩家
		service.notice.call(this, roomid, CMD.Main, CMD.Sub_CMD_P_UnReady, {
			roomid: roomid,
			userlist: ideal.data.getRoomUserList(roomid),
		});
	}

	service.sendMsg.call(this, CMD.Main, CMD.Sub_CMD_S_UnReady, data);
};

let recv_play = function(bodyBuff) {
	let model = protobuf['C_RoomPlay_Msg'];
	let example = model.decode(bodyBuff);

	// 房间ID
	let roomid = example.roomid;
	// 房间信息
	let room = ideal.data.roomlist[roomid];
	// 房间内用户信息
	let ruser = null;
	if (util.isDefine(room)) {
		ruser = room.userlist[this.user.username];
	}

	let data = { result: {}, roomid: roomid };

	// 房间不存在
	if (util.isEmpty(room) || util.isEmpty(ruser)) {
		data.result.code = 1;
		data.result.errmsg = '房间不存在!';
	}
	// 非空闲状态
	else if (room.status != 0) {
		data.result.code = 2;
		data.result.errmsg = '房间非空闲状态!';
	}
	// 非房主身份
	else if (ruser.identity != 1) {
		data.result.code = 3;
		data.result.errmsg = '无权开始游戏!';
	}
	else {
		let allready = true;
		for (let i in room.userlist) {
			if (room.userlist[i].status != 1) {
				allready = false; break;
			}
		};

		if (allready) {
			// 全部人都准备好了, 开始游戏
			data.result.code = 0;
			room.status = 1;

			// ############ 通知房间内的其他玩家
			service.notice.call(this, roomid, CMD.Main, CMD.Sub_CMD_P_Play, {
				roomid: roomid,
				userlist: ideal.data.getRoomUserList(roomid),
			});

			// ############ 有序的给一名玩家推送题目
			let username = ideal.data.getTopicUser(roomid);
			let CMDQ = require('./config')['Main_CMD_Question'];
			// 延迟600ms, 避免场景切换慢
			setTimeout(function() {
				service.notice2(username, CMDQ.Main, CMDQ.Sub_CMD_P_GetQuestion, {
					roomid: roomid,
					questionlist: ideal.data.getRandomTopic(),
				});
			}, 600);

			// 当前题库, 设置出题人
			room.topic.username = username;
		} else {
			// 还有人没有准备
			data.result.code = 4;
			data.result.errmsg = '还有人没有准备!';
		}
	}

	service.sendMsg.call(this, CMD.Main, CMD.Sub_CMD_S_Play, data);
};


// ############# 推送 #############

let push_leave = function(data) {
	let model = protobuf['S_LeaveRoom_Msg'];
	let example = model.create(data);
	let bodyBuff = model.encode(example).finish();

	service.send.call(this, CMD.Main, CMD.Sub_CMD_P_Leave, bodyBuff);
};

let push_join = function(data) {
	let model = protobuf['S_JoinRoom_Msg'];
	let example = model.create(data);
	let bodyBuff = model.encode(example).finish();

	service.send.call(this, CMD.Main, CMD.Sub_CMD_P_Join, bodyBuff);
};

let push_ready = function(data) {
	let model = protobuf['S_RoomReady_Msg'];
	let example = model.create(data);
	let bodyBuff = model.encode(example).finish();

	service.send.call(this, CMD.Main, CMD.Sub_CMD_P_Ready, bodyBuff);
};

let push_unready = function(data) {
	let model = protobuf['S_RoomUnReady_Msg'];
	let example = model.create(data);
	let bodyBuff = model.encode(example).finish();

	service.send.call(this, CMD.Main, CMD.Sub_CMD_P_UnReady, bodyBuff);
};

let push_play = function(data) {
	let model = protobuf['S_RoomPlay_Msg'];
	let example = model.create(data);
	let bodyBuff = model.encode(example).finish();

	service.send.call(this, CMD.Main, CMD.Sub_CMD_P_Play, bodyBuff);
};

module.exports = _service;
