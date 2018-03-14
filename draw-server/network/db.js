let db = {}, _db;

let mongo = require('mongodb').MongoClient;
let url = 'mongodb://localhost:27017';

// 查询
db.get = function(table, where = {}, callback) {
	if (util.isEmpty(_db)) {
		util.log('%-red', '  db is undefined.');
		util.isDefine(callback) && callback({ code: 501 });
		return;
	}

	_db.collection(table).find(where).toArray(function(err, ret) {
		let result = { code: 0 };
		if (util.isDefine(err)) {
			result = {
				code: 500,
				errmsg: err,
			};
			util.logat('%-red', '  Collection {1} find Error: {2}', table, err);
		} else {
			result = {
				code: 0,
				list: ret,
			};
		}

		util.isDefine(callback) && callback(result);
	});
};

// 添加
db.add = function(table, data = {}, callback) {
	if (util.isEmpty(_db)) {
		util.log('%-red', '  db is undefined.');
		util.isDefine(callback) && callback({ code: 501 });
		return;
	}

	_db.collection(table).insert(data, function(err, ret) {
		let result = { code: 0 };
		if (util.isDefine(err)) {
			result = {
				code: 500,
				errmsg: err,
			};
			util.logat('%-red', '  Collection {1} insert Error: {2}', table, err);
		} else {
			result = {
				code: 0,
				n: ret.result.n,
			};
			util.logat('%-gray', '  add count {1}', ret.result.n);
		}

		util.isDefine(callback) && callback(result);
	});
};

// 删除
db.del = function(table, where = {}, callback) {
	if (util.isEmpty(_db)) {
		util.log('%-red', '  db is undefined.');
		util.isDefine(callback) && callback({ code: 501 });
		return;
	}

	_db.collection(table).deleteMany(where, function(err, ret) {
		let result = { code: 0 };
		if (util.isDefine(err)) {
			result = {
				code: 500,
				errmsg: err,
			};
			util.logat('%-red', '  Collection {1} delete Error: {2}', table, err);
		} else {
			result = {
				code: 0,
				n: ret.result.n,
			};
			util.logat('%-gray', '  del count {1}', ret.result.n);
		}

		util.isDefine(callback) && callback(result);
	});
};

// 修改
db.mod = function(table, where = {}, data = {}, callback) {
	if (util.isEmpty(_db)) {
		util.log('%-red', '  db is undefined.');
		util.isDefine(callback) && callback({ code: 501 });
		return;
	}

	_db.collection(table).updateMany(where, data, function(err, ret) {
		let result = { code: 0 };
		if (util.isDefine(err)) {
			result = {
				code: 500,
				errmsg: err,
			};
			util.logat('%-red', '  Collection {1} modified Error: {2}', table, err);
		} else {
			result = {
				code: 0,
				n: ret.result.nModified,
			};
			util.logat('%-gray', '  mod count {1}', ret.result.nModified);
		}

		util.isDefine(callback) && callback(result);
	});
};

// 启动数据管理
db.init = function(callback) {
	util.log('%-green', '  DatabaseUrl: ' + url);

	mongo.connect(url, function(err, client) {
		if (util.isDefine(err)) {
			util.log('%-red', '  DB Connection Error: ' + err);
			return;
		}

		util.log('%-green', '  Connection success.\n');

		_db = client.db('draw');

		util.isDefine(callback) && callback();
	});
};

module.exports = db;
