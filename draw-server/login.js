require('./core/ideal');

let http = require('http');

const url  = require('url');
const util2 = require('util');
const querystring = require('querystring');

util.clear();

// 重定向, 获取本地IP地址
config.server.forEach(function(server) {
	server.address = util.getIp();
});

// 接收并解析请求
let recvRequest = function(param, req, res) {
	switch (req.url) {
		case '/login': do_login(param, req, res); break;
		case '/vali': do_vali(param, req, res); break;
		case '/register': do_register(param, req, res); break;
	}
};

// 通过账号密码登入
let do_login = function(param, req, res) {
	if (util.isEmpty(param.u) || util.isEmpty(param.p)) {
		res.write(JSON.stringify({
			code: 1,
			errmsg: '请输入账号密码！',
		}));
		res.end();
		return;
	}

	let where = { username: param.u };
	ideal.db.get('t_user', where, function(result) {
		let ret = {};
		let headers = {
			'Content-Type': 'text/plain; charset=utf-8;',
			'Access-Control-Allow-Origin': req.headers.origin,
			'Access-Control-Allow-Credentials': true,
		}

		if (result.code == 0 && result.list.length > 0) {
			// 密码验证通过
			if (util.md5(result.list[0].password) == param.p) {
				ret.code = 0;
				ret.token = require('node-uuid').v1();

				// 写入Cookie, 有效期3天
				let expire = 3 * 24 * 60 * 60 * 1000;
				headers['Set-Cookie'] = [];
				headers['Set-Cookie'][0] = util.format('uname={1}; max-age={2}', param.u, expire);
				headers['Set-Cookie'][1] = util.format('token={1}; max-age={2}', ret.token, expire);

				// 更新Token值和最后上线时间
				ideal.db.mod('t_user', { username: param.u }, {
					$set: {
						token: ret.token,
						onlinetime: Date.now(),
					}
				}, function() {
					res.writeHead(200, headers);
					res.write(JSON.stringify(ret));
					res.end();
				});

				return;
			} else {
				ret.code = 1;
				ret.errmsg = '密码错误！';
			}
		} else {
			ret.code = 1;
			ret.errmsg = '该账号不存在！';
		}

		res.writeHead(200, headers);
		res.write(JSON.stringify(ret));
		res.end();
	});
};

// 验证cookie是否过期
let do_vali = function(param, req, res) {
	if (util.isEmpty(param.uname) || util.isEmpty(param.token)) {
		res.write(JSON.stringify({
			code: 1,
			errmsg: '参数格式错误！',
		}));
		res.end();
		return;
	}

	let where = { username: param.uname };
	ideal.db.get('t_user', where, function(result) {
		let ret = {};
		let headers = {
			'Content-Type': 'text/plain; charset=utf-8;',
			'Access-Control-Allow-Origin': req.headers.origin,
			'Access-Control-Allow-Credentials': true,
		}

		if (result.code == 0 && result.list.length > 0) {
			// Token验证通过
			if (util.md5(result.list[0].token) == param.token) {
				ret.code = 0;
				ret.user = result.list[0];
			} else {
				ret.code = 1;
			}
		} else {
			ret.code = 1;
		}

		res.writeHead(200, headers);
		res.write(JSON.stringify(ret));
		res.end();
	});
};

// 注册账号
let do_register = function(param, req, res) {
	if (util.isEmpty(param.u) || util.isEmpty(param.p)) {
		res.write(JSON.stringify({
			code: 1,
			errmsg: '请输入账号密码！',
		}));
		res.end();
		return;
	}
	
	let where = { username: param.u };
	ideal.db.get('t_user', where, function(result) {
		let ret = {};

		if (result.code == 0 && result.list.length > 0) {
			ret.code = 1;
			ret.errmsg = '该账号已存在！';

			res.write(JSON.stringify(ret));
			res.end();

			return;
		}

		ideal.db.add('t_user', {
			username: param.u,
			password: param.p,
		}, function(result) {
			if (result.code == 0 && result.n > 0) {
				ret.code = 0;
				ret.errmsg = '注册成功！';
			} else {
				ret.code = 1;
				ret.errmsg = '注册失败！';
			}

			res.write(JSON.stringify(ret));
			res.end();
		});
	});
};

// 短请求服务器
let server = http.createServer(function(req, res) {
	let param = '';
	req.on('data', function(chunk) {
		param += chunk;
	});

	req.on('end', function() {
		try {
			res.writeHead(200, {
				'Content-Type': 'text/plain; charset=utf-8;',
				'Access-Control-Allow-Origin': req.headers.origin,
				'Access-Control-Allow-Credentials': true,
			});

			recvRequest(querystring.parse(param), req, res);
		}
		catch (err) {
			res.writeHead(500, {
				'Content-Type': 'text/plain; charset=utf-8;',
				'Access-Control-Allow-Origin': req.headers.origin,
				'Access-Control-Allow-Credentials': true,
			});
			res.end();
		}
	});
});

// 启动数据管理
ideal.db.init(function() {
	util.log('%-green', '  ServerUrl: ws://%s:%d', config.server[0].address, config.server[0].port);
	// 启动服务器
	server.allowHalfOpen = false;
	server.listen({
		port: config.server[0].port,
		host: config.server[0].address
	}, function() {
		util.log('%-green', '  Server is starting ...\n');
	});
});
