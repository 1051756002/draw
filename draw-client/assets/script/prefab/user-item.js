cc.Class({
    extends: cc.Component,

    properties: {
        sprHead: cc.Sprite,
        lblNick: cc.Label,
        layReady: cc.Node,
    },

    load: function(data) {
    	// 昵称
        this.lblNick.string = data.nick;

        // 头像
        if (util.isDefine(data.headimg)) {
	        cc.loader.loadRes(data.headimg, cc.SpriteFrame, function(err, spriteFrame) {
	        	if (err) { return; }
	        	this.sprHead.spriteFrame = spriteFrame;
	        }.bind(this));
        }
    },
});
