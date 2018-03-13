/**
 * 事件管理
 * 用户注册/触发监听事件。
 */
var event = {};
var eventPools = {};

event.addEventListener = function(type, selector, thisObj) {
	if (!eventPools[type]) {
		eventPools[type] = [];
	}
	eventPools[type].push({
		selector: selector,
		thisObj: thisObj,
	});
	return true;
};

event.removeEventListener = function(type, selector) {
	if (!eventPools[type]) {
		return false;
	}

	for (let i = eventPools[type].length - 1; i > -1; i--) {
		if (selector) {
			if (eventPools[type][i].selector == selector) {
				eventPools[type].splice(i, 1);
			}
		} else {
			eventPools[type].splice(i, 1);
		}
	}

	if (eventPools[type].length == 0) {
		delete eventPools[type];
	}
	return true;
};

event.triggerEvent = function(type, data) {
	if (!eventPools[type]) {
		return false;
	}

	for (let i = 0; i < eventPools[type].length; i++) {
		let thisObj = eventPools[type][i].thisObj;
		let selector = eventPools[type][i].selector;

		if (thisObj) {
			selector.call(thisObj, data);
		} else {
			selector(data);
		}
	}
	return true;
};

module.exports = event;