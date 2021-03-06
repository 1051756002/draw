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
	Main_CMD_Question: {
		// 主指令
		Main: 3,

		// 副指令
		Sub_CMD_C_Choice: 1,			// [请求] 选择题目
		Sub_CMD_C_Answer: 2,			// [请求] 提交答案

		Sub_CMD_S_Choice: 1001,			// [回馈] 选择题目
		Sub_CMD_S_Answer: 1002,			// [回馈] 提交答案

		Sub_CMD_P_GetQuestion: 2001,	// [回馈] 获取题目
		Sub_CMD_P_Choice: 2002,			// [推送] 选择题目
		Sub_CMD_P_Answer: 2003,			// [推送] 提交答案
		Sub_CMD_P_Publish: 2004,		// [推送] 公布答案
	},
	Main_CMD_Draw: {
		// 主指令
		Main: 4,

		// 副指令
		Sub_CMD_C_Draw: 1,			// [请求] 画
		Sub_CMD_C_Submit: 2,		// [请求] 提交作品
		Sub_CMD_C_Clean: 3,			// [请求] 清除

		Sub_CMD_S_Draw: 1001,		// [回馈] 画
		Sub_CMD_S_Submit: 1002,		// [回馈] 提交作品
		Sub_CMD_S_Clean: 1003,		// [回馈] 清除

		Sub_CMD_P_Draw: 2001,		// [推送] 画
		Sub_CMD_P_Submit: 2002,		// [推送] 提交作品
		Sub_CMD_P_Clean: 2003,		// [推送] 清除
	},
};
