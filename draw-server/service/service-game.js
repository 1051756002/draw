let service = {};
let CMD = require('./config')['Main_CMD_Game'];

service.parseMsg = function(mainCmd, subCmd, bodyBuff) {
	if (CMD.Main != mainCmd) {
		return false;
	}

	let exist = true;
	switch (subCmd) {
		case CMD.Sub_CMD_C_Enter:
			recv_enter(bodyBuff);
			break;
		default:
			exist = false;
			break;
	}
	return exist;
};


// ############# 接收 #############

let recv_enter = function(bodyBuff) {
	let model = protobuf['C_Test_Msg'];
	let example = model.decode(bodyBuff);

	util.log(example);
};

module.exports = service;
