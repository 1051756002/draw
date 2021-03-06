cc.Class({
    extends: cc.Component,

    properties: {
        sprHead: cc.Sprite,
        lblNick: cc.Label,
        layReady: cc.Node,
        layIdentity: cc.Node,
    },

    load: function(data) {
    	// 昵称
        this.lblNick.string = data.nick;

        if (data.headimg.length == 0) {
            data.headimg = 'img/head/head-7';
        }

        // 头像
        cc.loader.loadRes(data.headimg, cc.SpriteFrame, function(err, spriteFrame) {
        	if (err) { return; }
        	this.sprHead.spriteFrame = spriteFrame;
        }.bind(this));

        // 已准备标识
        this.layReady.active = data.status == 1 && data.identity != 1;

        // 房主标识
        this.layIdentity.active = data.identity == 1;
    },
});
