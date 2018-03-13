let _util = {};

_util.toTime = function(time) {
	var dt = Date.now() - time;
    if (dt >= 24 * 60 * 60 * 1000)
        return Math.floor(dt / (24 * 60 * 60 * 1000)) + '天前';
    else if (dt >= 60 * 60 * 1000)
        return Math.floor(dt / (60 * 60 * 1000)) + '小时前';
    else if (dt >= 60 * 1000)
        return Math.floor(dt / (60 * 1000)) + '分钟前';
    else if (dt >= 0)
        return '刚才';
    else
        return '';
};

_util.toTime2 = function(use_time, sys_time) {
	use_time = parseInt(use_time);
	if (typeof sys_time == 'undefined') {
		sys_time = Date.now();
	} else {
		sys_time = parseInt(sys_time);
	}

	let date_time = 24 * 60 * 60 * 1000;
	let diff_time = sys_time - use_time;
	let use_day = new Date(use_time).getDate();
	let sys_day = new Date(sys_time).getDate();

	// 显示日期
	if (diff_time > date_time || use_day != sys_day) {
		return util.fmtDate(use_time);
	}
	// 显示时间
	else {
		return util.fmtDate2(use_time);
	}
};

_util.fmtDate = function(obj) {
	let date = new Date(obj);
	let y = 1900 + date.getYear();
	let M = util.zeroize(date.getMonth() + 1);
	let d = util.zeroize(date.getDate());
	let h = util.zeroize(date.getHours());
	let m = util.zeroize(date.getMinutes());
	return util.format('{2}-{3} {4}:{5}', y, M, d, h, m);
};

_util.fmtDate2 = function(obj) {
	let date = new Date(obj);
	let h = util.zeroize(date.getHours());
	let m = util.zeroize(date.getMinutes());
	return util.format('{1}:{2}', h, m);
};

// 占位符字符串
_util.format = function() {
	var str = arguments[0];

	for (var i = 0; i < arguments.length; i++) {
		str = str.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
	}
	return str;
};

// 去空格
_util.trim = function(text) {
	if (typeof(text) == 'string') {
		return text.replace(/^\s*|\s*$/g, '');
	} else {
		return text;
	}
};

module.exports = _util;
