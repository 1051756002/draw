let _service = {};
let CMD = require('./config')['Main_CMD_Room'];

_service.sendMsg = function(mainCmd, subCmd, bodyBuff) {
	if (CMD.Main != mainCmd) {
		return false;
	}

	let exist = true;
	switch (subCmd) {
		case CMD.Sub_CMD_S_Match:
			send_match.call(this, bodyBuff);
			break;
		case CMD.Sub_CMD_S_Leave:
			push_leave.call(this, bodyBuff);
			break;
		case CMD.Sub_CMD_S_Join:
			push_join.call(this, bodyBuff);
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


// ############# 接收 #############

let recv_match = function(bodyBuff) {
	let model = protobuf['C_Match_Msg'];
	let example = model.decode(bodyBuff);

	let data = { result: {} };

	let roomlist = ideal.data.roomlist;

	/* roomlist[idx] => 
		'%roomid%': {
			roomid: '%roomid%',
			status: '0.空闲 1.进行中'
			userlist: {
				'%userid%': {}
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
			userlist: {}
		};
		// 加入此房间, 房主
		roomlist[roomid].userlist[username] = { identity: 1 };
	} else {
		// 加入此房间, 成员
		roomlist[roomid].userlist[username] = { identity: 0 };
	}

	// 匹配成功
	data.result.code = 0;
	data.roomid = roomid;
	data.userlist = ideal.data.getRoomUserList(roomid);

	service.sendMsg.call(this, CMD.Main, CMD.Sub_CMD_S_Match, data);



	// ############ 通知房间内的其他玩家

	let notice_data = {
		roomid: roomid,
		userlist: ideal.data.getRoomUserList(roomid),
	};

	// 通知此房间内每一位玩家, 此号退出房间了
	let unames = Object.keys(roomlist[roomid].userlist);

	for (let j in unames) {
		// 不通知自己
		if (unames[j] == username) { continue; }

		let cli = ideal.data.clientlist[unames[j]];
		service.sendMsg.call(cli, CMD.Main, CMD.Sub_CMD_S_Join, notice_data);
	};
};

let recv_ready = function(bodyBuff) {

};

let recv_unready = function(bodyBuff) {

};

let recv_play = function(bodyBuff) {

};


// ############# 推送 #############

let push_leave = function(data) {
	let model = protobuf['S_LeaveRoom_Msg'];
	let example = model.create(data);
	let bodyBuff = model.encode(example).finish();

	service.send.call(this, CMD.Main, CMD.Sub_CMD_S_Leave, bodyBuff);
};

let push_join = function(data) {
	let model = protobuf['S_JoinRoom_Msg'];
	let example = model.create(data);
	let bodyBuff = model.encode(example).finish();

	service.send.call(this, CMD.Main, CMD.Sub_CMD_S_Join, bodyBuff);
};

module.exports = _service;
