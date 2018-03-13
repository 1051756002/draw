let service = {};
let CMD = require('./service-config')['Main_CMD_Game'];

service.sendMsg = function(cmd, data) {
	let exist = true;
	switch (cmd) {
		case 'enter':
			send_enter(data);
			break;
		default:
			exist = false;
			break;
	}
	return exist;
};

service.parseMsg = function(mainCmd, subCmd, bodyBuff) {
	if (CMD.Main != mainCmd) {
		return false;
	}

	let exist = true;
	switch (subCmd) {
		case CMD.Sub_CMD_S_Enter:
			recv_enter(bodyBuff);
			break;
		default:
			exist = false;
			break;
	}
	return exist;
};


// ############# 发送 #############

let send_enter = function(data) {
	let model = protobuf['C_Test_Msg'];
	let example = model.create({
		value: data.value,
	});
	let bodyBuff = model.encode(example).finish();

	ideal.conn.sendMsg(CMD.Main, CMD.Sub_CMD_C_Enter, bodyBuff);
};


// ############# 接收 #############

let recv_enter = function(bodyBuff) {
	let model = protobuf['S_Test_FbMsg'];
	let example = model.decode(bodyBuff);

	util.log(example);
};

module.exports = service;
