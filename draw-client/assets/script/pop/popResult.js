cc.Class({
    extends: require('./basePop'),

    properties: {
        lblAnswer: cc.Label,
    },

    init: function(data) {
        this.lblAnswer.string = data.answer;

        let callback = function() {
            this.onClose();
            cc.director.getScheduler().unschedule(callback, this);
        }

        cc.director.getScheduler().schedule(callback, this, 3);
    },
});
