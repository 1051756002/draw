let cache = {};
let source = require('./data-source');

// 读取缓存
cache.read = function() {
	if (config.UseCache) {
		let userData = cc.sys.localStorage.getItem('userData');
		try {
			let data = JSON['parse'](userData);
		} catch (err) {
			cc.log('ERROR: data_cache.js userData cache not JSON.');
			return;
		}
		for (let i in data) {
			source[i] = data[i];
		}
	}
};

// 保存缓存
cache.save = function() {
	if (config.UseCache) {
		cc.sys.localStorage.setItem('userData', JSON['stringify'](source));
	}
};

// 清除缓存
cache.clear = function() {
	if (config.UseCache) {
		cc.sys.localStorage.setItem('userData', JSON['stringify']({}));
	}
};

module.exports = cache;
