cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad: function() {
        ideal.init(function() {
            util.log('%-#0fe029', 'ideal framework initialization end.');

            // let uname = util.getQueryString('uname', util.getCookie('uname'));
            // let token = util.getQueryString('token', util.getCookie('token'));

            // if (util.isDefine(uname) && util.isDefine(token)) {
            //     this.valiToken(uname, token);
            // } else {
            //     cc.director.loadScene('login');
            // }
            cc.director.loadScene('main');
        }.bind(this));
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
                cc.director.loadScene('main');
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
