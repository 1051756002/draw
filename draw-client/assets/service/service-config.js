module.exports = {
	Main_CMD_Login: {
		// 主指令
		Main: 1,
		// 副指令
		Sub_CMD_C_Login: 1,			// [请求] 登录
		Sub_CMD_S_Login: 1001,		// [回馈] 登录
	},
	Main_CMD_Room: {
		// 主指令
		Main: 2,
		// 副指令
		Sub_CMD_C_Match: 1,			// [请求] 匹配
		Sub_CMD_S_Match: 1001,		// [回馈] 匹配
		Sub_CMD_S_Leave: 1002,		// [推送] 离开房间
		Sub_CMD_S_Join: 1003,		// [推送] 加入房间
	},
	Main_CMD_Draw: {
		// 主指令
		Main: 3,
		// 副指令
	},
};
