// 合并所有util函数
module.exports = Object.assign.apply(Object, [
	require('./util-log'),
	require('./util-data'),
	require('./util-string'),
	require('./util-common'),
	require('./util-cookie'),
	require('./util-ui'),
]);
