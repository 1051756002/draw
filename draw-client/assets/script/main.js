cc.Class({
    extends: cc.Component,

    properties: {
        draw: require('draw'),
        layPalette: cc.Node,
        layParticipant: cc.Node,
        btnAnswer: cc.Button,
        btnPalette: cc.Button,
        lblTime: cc.Label,

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
        ideal.conn.on('answer.success', this.onAnswerFb, this);
        ideal.conn.on('push.clean', this.onPushClean, this);
        ideal.conn.on('push.choice', this.onPushChoice, this);
        ideal.conn.on('push.answer', this.onPushAnswer, this);
        ideal.conn.on('push.getquestion', this.onPushGetQuestion, this);
        ideal.conn.on('push.draw', this.onPushDraw, this);
    },

    unbindEvent: function() {
        ideal.conn.off('choice.success', this.onChoiceFb);
        ideal.conn.off('clean.success', this.onCleanFb);
        ideal.conn.off('answer.success', this.onAnswerFb);
        ideal.conn.off('push.clean', this.onPushClean);
        ideal.conn.off('push.choice', this.onPushChoice);
        ideal.conn.off('push.answer', this.onPushAnswer);
        ideal.conn.off('push.getquestion', this.onPushGetQuestion);
        ideal.conn.off('push.draw', this.onPushDraw);
    },

    init: function() {
        window.kk = this;

        // 倒计时
        this.countdown = 100;

        // [节点]参赛者列表
        this.partList = [];

        this.initParticipant();

        this.initUI();
    },

    initUI: function() {
        let username = ideal.data.user.username;
        let userlist = ideal.data.room.userlist;
        let ruser = util.okey(userlist, 'username', username);

        this.layPalette.active = ruser.active == 1;
        this.btnAnswer.node.active = ruser.active != 1;

        // 初始化倒计时
        this.countdown = 100;
        this.lblTime.string = this.countdown;
    },

    // 开始倒计时
    playCountdown: function() {
        this.stopCountdown();
        cc.director.getScheduler().schedule(this.nextCountdown, this, 1);
    },

    // 停止倒计时
    stopCountdown: function() {
        cc.director.getScheduler().unschedule(this.nextCountdown, this);
    },

    nextCountdown: function() {
        if (this.countdown <= 0) {
            this.stopCountdown();
            return;
        }
        this.lblTime.string = --this.countdown;
    },

    // 初始化参赛者
    initParticipant: function() {
        // 清除子节点
        this.layParticipant.removeAllChildren();

        cc.loader.loadRes('./prefab/part-item', cc.Prefab, function(err, prefab) {
            if (err) {
                throw err;
            }

            let topic = ideal.data.room.topic;
            let userlist = ideal.data.room.userlist;

            for (let i in userlist) {
                let itemPrefab = cc.instantiate(prefab);
                itemPrefab.parent = this.layParticipant;
                this.partList[i] = itemPrefab.getComponent('part-item');
                this.partList[i].init(userlist[i]);
            };
        }.bind(this));
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

    // 抢答
    onAnswer: function() {
        util.showPop('answer');
    },

    // [推送]获取题目列表
    onPushGetQuestion: function(data) {
        util.showPop('topic', data);
    },

    // [推送]其他人提交答案
    onPushAnswer: function(data) {
        // 回答正确
        if (data.correct == 1) {
            util.showTips('回答正确!');
        } else {
            let part = util.okey(this.partList, 'username', data.username);
            part.say(data.answer);
        }
    },

    // [推送]出题者选择了题目
    onPushChoice: function(data) {
        // 开始直播
        this.draw.playLive();
        // 开始倒计时
        this.playCountdown();
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
        // 开始倒计时
        this.playCountdown();
    },

    // [回馈]清空
    onCleanFb: function(data) {
        this.draw.group.children.length = 0;
        this.draw.group.ctx.clear();
    },

    // [回馈]提交答案
    onAnswerFb: function(data) {
        // 回答正确
        if (data.result.code == 0) {
            util.showTips('回答正确!');
        } else {
            let user = ideal.data.user;
            let part = util.okey(this.partList, 'username', user.username);
            part.say(data.answer);
        }
    },
});
