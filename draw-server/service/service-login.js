let service = {};
let CMD = require('./config')['Main_CMD_Login'];

service.parseMsg = function(mainCmd, subCmd, bodyBuff) {
	if (CMD.Main != mainCmd) {
		return false;
	}

	let exist = true;
	switch (subCmd) {
		case CMD.Sub_CMD_C_Login:
			recv_login(bodyBuff);
			break;
		default:
			exist = false;
			break;
	}
	return exist;
};


// ############# 接收 #############

let recv_login = function(bodyBuff) {
	let model = protobuf['C_Login_Msg'];
	let example = model.decode(bodyBuff);

	util.log(example);
};

module.exports = service;
