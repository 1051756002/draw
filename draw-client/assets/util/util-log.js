let _util = {};

// 控制平台打印日志
_util.log = function() {
	if (!config.debug) {
		return;
	}
	let args = [];
	for (let i = 0; i < arguments.length; i++) {
		args.push(arguments[i]);
	}

	if (typeof args[0] == 'string') {
		// 字体颜色过滤
		let result = args[0].match(/^%-#([a-z|0-9]*)$/i);
		if (result != null && result.length == 2) {
			args[1] = '%c' + args[1];
			args.push('color:#' + result[1]);
			args.shift();
		}
	}

	console.log.apply(console, args);
};

// 控制平台打印日志, 采用format模式(占位符)
_util.logat = function() {
	let args = [];
	for (let i = 0; i < arguments.length; i++) {
		args.push(arguments[i]);
	}

	// 字体颜色过滤
	if (/^%-#([a-z|0-9]*)$/i.test(args[0].toString())) {
		util.log(args.shift(), util.format.apply(util, args));
	} else {
		util.log(util.format.apply(util, args));
	}
};

// 控制平台打印警告
_util.warn = function() {
	if (!config.debug) {
		return;
	}
	let args = [];
	for (let i = 0; i < arguments.length; i++) {
		args.push(arguments[i]);
	}
	console.warn.apply(console, args);
};

// 清空控制台消息
_util.clear = function() {
	console.clear();
};

module.exports = _util;
