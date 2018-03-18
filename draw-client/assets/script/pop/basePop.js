cc.Class({
    extends: cc.Component,

    init: function(data) {
    	util.log('basePop.', data);
    },

    onClose: function() {
        this.node.active = false;
    },
});
