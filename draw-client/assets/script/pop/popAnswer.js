cc.Class({
    extends: require('./basePop'),

    properties: {
        txtAnswer: cc.EditBox,
        btnConfirm: cc.Button,
    },

    onLoad: function() {
    	this.bindEvents();
    },

    onDestroy: function() {
        this.unbindEvent();
    },

    init: function() {
        this.txtAnswer.string = '';
    },

    bindEvents: function() {
        ideal.conn.on('answer.success', this.onAnswerFb, this);
    },

    unbindEvent: function() {
        ideal.conn.off('answer.success', this.onAnswerFb);
    },

    // [请求]抢答
    onAnswer: function() {
        let data = this.data;

        ideal.conn.send('answer', {
            answer: this.txtAnswer.string,
        });
    },

    // [回馈]抢答
    onAnswerFb: function(data) {
    	this.onClose();
    },
});
