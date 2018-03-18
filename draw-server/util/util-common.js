let _util = {};

_util.requireDir = function(dirName) {
	let walk = require('walkdir');
	let path = require('path');
	let obj = {};

	walk.sync(dirName, function(pathName, stats) {
		let fileName = pathName.split(path.sep).pop();
		let lastIdx = fileName.lastIndexOf('.');

		if (lastIdx > -1) {
			obj[fileName.slice(0, lastIdx)] = require(pathName);
		}
	});

	return obj;
};

// 是否为空对象
_util.isEmpty = function(val) {
	switch (typeof(val)) {
		case 'string':
			return util.trim(val).length == 0 ? true : false;
			break;
		case 'number':
			return val == 0;
			break;
		case 'object':
			return val == null;
			break;
		case 'array':
			return val.length == 0;
			break;
		case 'function':
			return false;
			break;
		default:
			return true;
	}
};

// 是否定义了该内容
_util.isDefine = function(val) {
	return !util.isEmpty(val);
};

// 获取IP地址
_util.getIp = function() {
	let ips, ip = '127.0.0.1';
	let os = require('os');
	let ifaces = os.networkInterfaces();

	let reg = /^192\.168\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)$/;
	for (let t in ifaces) {
		ips = ifaces[t];

		for (let i in ips) {
			if (ips[i].address) {
				if (reg.test(ips[i].address)) {
					return ips[i].address;
				}
			}
		}
	}

	// for (let t in ifaces) {
	// 	ips = ifaces[t];
	// 	// 苹果系统, 以太网
	// 	if ('WLAN' == t) {
	// 		break;
	// 	}

	// 	// Windows系统, 本地连接
	// 	if (/^本地连接/.test(t)) {
	// 		break;
	// 	}
	// }

	// for (let i = 0; i < ips.length; i++) {
	// 	if (ips[i].family == 'IPv4') {
	// 		ip = ips[i].address;
	// 		break;
	// 	}
	// }
	return ip;
};

module.exports = _util;
