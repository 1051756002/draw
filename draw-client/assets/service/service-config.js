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
		Sub_CMD_C_Ready: 2,			// [请求] 准备
		Sub_CMD_C_UnReady: 3,		// [请求] 取消准备
		Sub_CMD_C_Play: 4,			// [请求] 开始游戏

		Sub_CMD_S_Match: 1001,		// [回馈] 匹配
		Sub_CMD_S_Ready: 1004,		// [回馈] 准备
		Sub_CMD_S_UnReady: 1005,	// [回馈] 取消准备
		Sub_CMD_S_Play: 1006,		// [回馈] 开始游戏

		Sub_CMD_P_Leave: 2001,		// [推送] 离开房间
		Sub_CMD_P_Join: 2002,		// [推送] 加入房间
		Sub_CMD_P_Ready: 2003,		// [推送] 准备
		Sub_CMD_P_UnReady: 2004,	// [推送] 取消准备
		Sub_CMD_P_Play: 2005,		// [推送] 开始游戏
	},
	Main_CMD_Draw: {
		// 主指令
		Main: 3,

		// 副指令
	},
};
