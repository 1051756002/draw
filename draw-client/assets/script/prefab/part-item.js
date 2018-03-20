cc.Class({
    extends: cc.Component,

    properties: {
        hook: cc.Node,
        sprHead: cc.Sprite,
        lblNick: cc.Label,
        bgHead: cc.Sprite,
        bgNick: cc.Sprite,
        lblAnswer: cc.Label,
        laySuspension: cc.Node,
    },

    init: function(data) {
        this.data = data;
        // 用于标记
        this.username = data.username;

        // 昵称
        this.lblNick.string = data.nick;

        // 头像
        if (util.isDefine(data.headimg)) {
            cc.loader.loadRes(data.headimg, cc.SpriteFrame, function(err, spriteFrame) {
                if (err) { return; }
                this.sprHead.spriteFrame = spriteFrame;
            }.bind(this));
        }

        // 修改身份样式
        this.updateStyle(data.active);
        
        this.laySuspension.stopAllActions();
        this.laySuspension.runAction(cc.fadeOut());
        this.hook.active = false;
    },

    onDestroy: function() {
        cc.director.getScheduler().unschedule(this.unsay, this);
    },

    // 说话, 报答案(错误答案)
    say: function(answer) {
        this.lblAnswer.string = answer;

        // 复位透明度
        this.laySuspension.stopAllActions();
        this.laySuspension.runAction(cc.fadeIn());

        // 复位延迟回调
        cc.director.getScheduler().unschedule(this.unsay, this);
        cc.director.getScheduler().schedule(this.unsay, this, 3);
    },

    // 取消说话
    unsay: function() {
        this.laySuspension.runAction(cc.fadeOut(1));
    },

    // 回答正确
    correct: function() {
        this.laySuspension.runAction(cc.fadeOut());
        this.hook.active = true;
    },

    // 更新样式, 1.出题者 0.答题者
    updateStyle: function(active) {
        let res_bgnick, res_bghead;

        // 出题者
        if (active == 1) {
            res_bgnick = './img/common_b1';
            res_bghead = './img/common_head_2';
        }
        // 答题者
        else {
            res_bgnick = './img/common_b';
            res_bghead = './img/common_head_1';
        }

        // 昵称背景
        cc.loader.loadRes(res_bgnick, cc.SpriteFrame, function(err, spriteFrame) {
            if (err) { return; }
            this.bgNick.spriteFrame = spriteFrame;
        }.bind(this));
        // 头像背景
        cc.loader.loadRes(res_bghead, cc.SpriteFrame, function(err, spriteFrame) {
            if (err) { return; }
            this.bgHead.spriteFrame = spriteFrame;
        }.bind(this));
    },
});
