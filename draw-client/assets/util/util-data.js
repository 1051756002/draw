let _util = {};

// 深拷贝
_util.clone = function(obj) {
	var str, newobj = obj.constructor === Array ? [] : {};
	if (typeof obj !== 'object') {
		return;
	} else if (window.JSON) {
		str = JSON.stringify(obj), newobj = JSON.parse(str);
	} else {
		for (var i in obj) {
			newobj[i] = typeof obj[i] === 'object' ? util.clone(obj[i]) : obj[i];
		}
	}
	return newobj;
};

// 补零
_util.zeroize = function(val, num) {
	if (typeof num == 'undefined') {
		num = 2;
	}
	let str = '';
	for (let i = 0; i < num; i++) {
		str += '0';
	}
	str += val;
	return str.substring(str.length - num);
};

// 生成随机数
_util.rnd = function(min, max) {
	if (typeof max == 'undefined') {
		max = min;
		min = 0;
	}

	return Math.floor(Math.random() * max + min);
};

// md5加密
_util.md5 = function(content) {
	let md5 = require('md5');

	if ( typeof md5 == 'function') {
		return md5(util.trim(content));
	} else {
		return content;
	}
};

// 获取对象的属性总数量
_util.olen = function(obj) {
	if (Object['getOwnPropertyNames']) {
		return Object.getOwnPropertyNames(obj).length;
	}

	let len = 0;
	for (let i in obj) {
		len++;
	};
	return len;
};

// 合并对象
_util.merge = function(def, obj) {
	for (var k in def) {
		if (typeof obj[k] === 'undefined') {
			obj[k] = def[k];
		}
	}
	return obj;
};

// 求和坐标
_util.sumPoint = function(p1, p2) {
	return cc.p(p1.x + p2.x, p1.y + p2.y);
};

// 求差坐标
_util.subPoint = function(p1, p2) {
	return cc.p(p1.x - p2.x, p1.y - p2.y);
};

module.exports = _util;
