let _util = {};

/**
 * 显示节点
 * @param popName
 * @returns {null}
 */
_util.showPop = function (name, params) {
	let nodeName = /^pop_/.test(name) ? name : 'pop_' + name;

	let node = cc.find(nodeName);
	if (util.isEmpty(node)) {
		util.warn(nodeName + ' can\'t find.');
		return null;
	}

	node.active = true;

	let basePop = node.getComponent('basePop');
	basePop.init(params);

	return node;
};

/**
 * 隐藏节点
 * @param popName
 * @returns {null}
 */
_util.hidePop = function (name) {
	let nodeName = /^pop_/.test(name) ? name : 'pop_' + name;

	let node = cc.find(nodeName);
	if (util.isDefine(node)) {
		node.active = false;
	} else {
		util.warn(nodeName + ' can\'t find.');
	}

	return node;
};

/**
 * 显示提示
 * @param content
 * @param callback
 */
_util.showTips = function(content, callback) {
	let node = util.showPop('tips');

	let popTips = node.getComponent('popTips');
	popTips.lblContent.string = content;
};

module.exports = _util;
