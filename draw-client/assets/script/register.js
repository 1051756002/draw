cc.Class({
    extends: cc.Component,

    properties: {
        txtUser: cc.EditBox,
        txtPwd: cc.EditBox,
        txtPwd2: cc.EditBox,
    },

    onRegister: function() {
        let param = {
            u: util.trim(this.txtUser.string),
            p: util.trim(this.txtPwd.string),
            p2: util.trim(this.txtPwd2.string),
        };

        if (param.u.length == 0) {
            util.log('请输入账号！');
            return;
        }

        if (param.p.length == 0 || param.p2.length == 0) {
            util.log('请输入密码！');
            return;
        }

        if (param.p != param.p2) {
            util.log('两次输入密码不一致！');
            return;
        }

        delete param.p2;
        $.ajax({
            url: util.format('http://{1}:{2}/register', config.server[0].address, config.server[0].port),
            type: 'post',
            dataType: 'json',
            xhrFields: { withCredentials: true },
            data: param,
            success: function(res) {
                if (res.code == 0) {
                    util.log('注册成功！');

                    cc.director.loadScene('login');
                } else {
                    util.log(res.errmsg);
                }
            },
            fail: function(res) {
                util.log('fail');
            }
        });
    },

    onBack: function() {
        cc.director.loadScene('login');
    },
});
