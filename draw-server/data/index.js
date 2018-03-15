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

// 获取房间内的用户列表
data.getRoomUserList = function(roomid) {
	let userlist = [];
	for (let uid in this.roomlist[roomid].userlist) {
		let user = util.clone(this.userlist[uid]);

		// 找不到此用户
		if (util.isEmpty(user)) {
			util.logat('  can\'t find userid: ', uid);
			continue;
		}
		userlist.push({
			username: user.username,
			nick: user.nick,
			onlinetime: user.onlinetime,
			headimg: user.headimg,
		});
	};
	return userlist;
};

module.exports = data;
