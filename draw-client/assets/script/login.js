cc.Class({
    extends: cc.Component,

    properties: {
        txtUser: cc.EditBox,
        txtPwd: cc.EditBox,
    },

    onLoad: function() {
    },

    onLogin: function() {
        let param = {
            u: util.trim(this.txtUser.string),
            p: util.trim(this.txtPwd.string),
        };

        if (param.u.length == 0) {
            util.log('请输入账号！');
            return;
        }

        if (param.p.length == 0) {
            util.log('请输入密码！');
            return;
        }

        param.p = util.md5(param.p);

        $.ajax({
            url: util.format('http://{1}:{2}/login', config.server[0].address, config.server[0].port),
            type: 'post',
            dataType: 'json',
            xhrFields: { withCredentials: true },
            data: param,
            success: function(res) {
                if (res.code == 0) {
                    util.log('登录成功！');
                    util.log('token: ' + res.token);

                    cc.director.loadScene('room');
                } else {
                    util.log(res.errmsg);
                }
            },
            fail: function(res) {
                util.log('fail');
            }
        });
    },

    onGoRegister: function() {
        cc.director.loadScene('register');
    },
});
