let _util = {};

/**
 * 获得cookie
 * @param key
 * @returns {null}
 */
_util.getCookie = function (key, defval) {
    var arr, reg = new RegExp("(^| )" + key + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg)) {
        return unescape(arr[2]);
    }
    return util.isDefine(defval) ? defval : null;
};

module.exports = _util;
