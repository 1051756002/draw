let _service = {};
let CMD = require('./config')['Main_CMD_Login'];

_service.sendMsg = function(mainCmd, subCmd, data) {
	if (CMD.Main != mainCmd) {
		return false;
	}

	let exist = true;
	switch (subCmd) {
		case CMD.Sub_CMD_S_Login:
			send_login.call(this, data);
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
		case CMD.Sub_CMD_C_Login:
			recv_login.call(this, bodyBuff);
			break;
		default:
			exist = false;
			break;
	}
	return exist;
};


// ############# 发送 #############

let send_login = function(data) {
	let model = protobuf['S_Login_FbMsg'];
	let example = model.create(data);
	let bodyBuff = model.encode(example).finish();

	service.send.call(this, CMD.Main, CMD.Sub_CMD_S_Login, bodyBuff);
};


// ############# 接收 #############

let recv_login = function(bodyBuff) {
	let model = protobuf['C_Login_Msg'];
	let example = model.decode(bodyBuff);

	let data = { result: {} };

	if (util.isEmpty(example.username) || util.isEmpty(example.token)) {
		data.result.code = 1;
		data.result.errmsg = '参数异常!';
		service.sendMsg.call(this, CMD.Main, CMD.Sub_CMD_S_Login, data);
		return;
	}

	let where = {
		username: example.username,
		token: example.token,
	};
	ideal.db.get('t_user', where, function(result) {
		if (result.code == 0 && result.list.length > 0) {
			// 登录成功
			data.result.code = 0;
			// 赋值用户信息到Client上
			this.user = result.list[0];

			// 加入在线用户列表
			ideal.data.userlist[example.username] = result.list[0];
			// 加入客户端列表
			ideal.data.clientlist[example.username] = this;
		} else {
			// 登录失败, token匹配失败
			data.result = result;
		}
		service.sendMsg.call(this, CMD.Main, CMD.Sub_CMD_S_Login, data);
	}.bind(this));
};

module.exports = _service;
