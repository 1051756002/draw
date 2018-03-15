let data = {
	source: require('./data-source'),
};
let source = data.source;

// 用户信息
Object.defineProperty(data, 'user', {
	get: function() {
		return source.user;
	},
	set: function(val) {
		// 用户名/账号
		if (util.isDefine(val.username)) {
			source.user.username = val.username;
		}
		// 昵称
		if (util.isDefine(val.nick)) {
			source.user.nick = val.nick;
		}
		// token
		if (util.isDefine(val.token)) {
			source.user.token = val.token;
		}
		return true;
	},
});

// 房间信息
Object.defineProperty(data, 'room', {
	get: function() {
		return source.room;
	},
	set: function(val) {
		// 房间ID
		if (util.isDefine(val.roomid)) {
			source.room.roomid = val.roomid;
		}
		// 房间内玩家列表
		if (util.isDefine(val.userlist)) {
			source.room.userlist = val.userlist;
		}
		return true;
	},
});

module.exports = data;
