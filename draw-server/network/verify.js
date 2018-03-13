var incUid = 100;

module.exports = function(info, callback) {
	info.req.incUid = ++incUid;
	callback(true);
};
