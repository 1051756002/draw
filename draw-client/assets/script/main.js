cc.Class({
    extends: cc.Component,

    properties: {
        draw: require('draw'),
        layPalette: cc.Node,
        btnPalette: cc.Button,

        // 是否显示工具栏
        displayPalette: {
            default: false,
            visible: false,
        },
    },

    onLoad: function () {
        this.init();
        this.bindEvents();
    },

    onDestroy: function() {
        this.unbindEvent();
    },

    bindEvents: function() {
        ideal.conn.on('choice.success', this.onChoiceFb, this);
        ideal.conn.on('clean.success', this.onCleanFb, this);
        ideal.conn.on('push.clean', this.onPushClean, this);
        ideal.conn.on('push.choice', this.onPushChoice, this);
        ideal.conn.on('push.answer', this.onPushAnswer, this);
        ideal.conn.on('push.getquestion', this.onPushGetQuestion, this);
        ideal.conn.on('push.draw', this.onPushDraw, this);
    },

    unbindEvent: function() {
        ideal.conn.off('choice.success', this.onChoiceFb);
        ideal.conn.off('clean.success', this.onCleanFb);
        ideal.conn.off('push.clean', this.onPushClean);
        ideal.conn.off('push.choice', this.onPushChoice);
        ideal.conn.off('push.answer', this.onPushAnswer);
        ideal.conn.off('push.getquestion', this.onPushGetQuestion);
        ideal.conn.off('push.draw', this.onPushDraw);
    },

    init: function() {
        window.kk = this;
    },

    // 切换调色板显示/隐藏
    onTogglePalette: function() {
        this.displayPalette = !this.displayPalette;

        if (this.displayPalette) {
            this.layPalette.stopAllActions();
            this.layPalette.runAction(cc.moveTo(0.15, 0, 0));
        } else {
            this.layPalette.stopAllActions();
            this.layPalette.runAction(cc.moveTo(0.15, 310, 0));
        }
    },

    // 选择颜色
    onChoiceColor: function(ev) {
        var target = ev.target;

        var drawAttr = this.draw.drawAttr;
        drawAttr.strokeColor = target.color;

        // 橡皮擦范围扩大
        if (cc.colorEqual(target.color, cc.color(255, 255, 255))) {
            drawAttr.lineWidth = 20;
        } else {
            drawAttr.lineWidth = 5;
        }

        // 更新选中的颜色
        var layout = cc.find('layout', this.layPalette);
        layout.children.forEach(function(node) {
            // 清除按钮
            if (node.name == 'clean') {
                return;
            }
            if (node != target) {
                node.children[0].active = false;
            } else {
                node.children[0].active = true;
            }
        });
    },

    // 清除
    onClean: function() {
        ideal.conn.send('clean');
    },

    // [推送]获取题目列表
    onPushGetQuestion: function(data) {
        util.showPop('topic', data);
    },

    // [推送]其他人提交答案
    onPushAnswer: function(data) {

    },

    // [推送]出题者选择了题目
    onPushChoice: function(data) {
        // util.log(data);
        this.draw.playLive();
    },

    // [推送]笔画
    onPushDraw: function(data) {
        // util.log(data);
        this.draw.livePoints.push(data.line);
    },

    // [推送]清空
    onPushClean: function(data) {
        this.draw.group.children.length = 0;
        this.draw.group.ctx.clear();
    },

    // [回馈]选题
    onChoiceFb: function(data) {
        // 开启画图功能
        this.draw.enableDraw = true;
    },

    // [回馈]清空
    onCleanFb: function(data) {
        this.draw.group.children.length = 0;
        this.draw.group.ctx.clear();
    },

    // [回馈]提交答案
    onAnswerFb: function(data) {

    },
});
