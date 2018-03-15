cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad: function() {
        let uname = util.getQueryString('uname', util.getCookie('uname'));
        let token = util.getQueryString('token', util.getCookie('token'));

        if (util.isDefine(uname) && util.isDefine(token)) {
            this.valiToken(uname, token);
        } else {
            cc.director.loadScene('login');
        }
    },

    valiToken: function(uname, token) {
        let address = config.server[0].address;
        let port = config.server[0].port;
        let url = util.format('http://{1}:{2}/vali', address, port);

        let param = {
            uname: util.trim(uname),
            token: util.md5(token),
        };

        let successFn = function(res) {
            if (res.code == 0) {
                // 保存用户信息
                ideal.data.user = res.user;

                cc.director.loadScene('room');
            } else {
                cc.director.loadScene('login');
            }
        };

        let failFn = function(res) {
            util.log('fail', res);
        };

        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            xhrFields: { withCredentials: true },
            data: param,
            success: successFn,
            fail: failFn,
        });
    },
});
