let data = {
	source: require('./data-source'),
};
let source = data.source;

// 在线用户列表
Object.defineProperty(data, 'userlist', {
	get: function() {
		return source.user.list;
	},
});

// 客户端列表
Object.defineProperty(data, 'clientlist', {
	get: function() {
		return source.client.list;
	},
});

// 房间列表
Object.defineProperty(data, 'roomlist', {
	get: function() {
		return source.room.list;
	},
});

// 题目列表
Object.defineProperty(data, 'questionlist', {
	get: function() {
		return source.question.list;
	},
});

// 获取房间内的用户列表
data.getRoomUserList = function(roomid) {
	let userlist = [];
	let room = this.roomlist[roomid];
	for (let uname in room.userlist) {
		let user = util.clone(this.userlist[uname]);
		let ruser = room.userlist[uname];

		// 找不到此用户
		if (util.isEmpty(user)) {
			util.logat('  can\'t find userid: ', uname);
			continue;
		}
		userlist.push({
			username: user.username,
			nick: user.nick,
			headimg: user.headimg,
			identity: ruser.identity,
			status: ruser.status,
			active: room.topic.username == uname ? 1 : 0,
		});
	};
	return userlist;
};

// 获取房间出题用户
data.getTopicUser = function(roomid) {
	let username = null;
	let histlist = this.roomlist[roomid].hist;
	let userlist = this.roomlist[roomid].userlist;

	// 获取未出题的用户
	for (let uname in userlist) {
		if (histlist.indexOf(uname) == -1) {
			username = uname;
			histlist.unshift(uname);
			break;
		}
	};

	return username;
};

// 获取随机题目列表
data.getRandomTopic = function() {
	let qlist = util.clone(source.question.list);

	// 随机打乱顺序
	qlist.sort(function(a, b) {
		return util.rnd(2) == 0 ? 1 : -1;
	});

	return qlist.splice(0, 3);
};

module.exports = data;
