cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad: function () {
        this.init();
        this.bindEvents();
    },

    onDestroy: function() {
        this.unbindEvent();
    },

    bindEvents: function() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchBegan, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoved, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnded, this);

        ideal.conn.on('draw.feedback', this.onDrawFb, this);
    },

    unbindEvent: function() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchBegan);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoved);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnded);

        ideal.conn.off('draw.feedback', this.onDrawFb);
    },

    init: function() {
        this.group = this.addComponent('R.group');

        // 画板属性
        this.drawAttr = {
            debug: false,
            fillColor: 'none',
            lineWidth: 5,
            strokeColor: cc.hexToColor('#000'),
        };

        // 是否开启画图功能
        this.enableDraw = false;
        // 历史笔画列表
        this.histPoints = [];
        // 直播笔画列表
        this.livePoints = [];
        // 直播当前笔画(线)索引
        this.liveLineCurr = 0;
        // 直播当前笔画(点)索引
        this.livePointCurr = 0;
        // 直播当前笔画
        this.livePath = null;
    },

    playLive: function() {
        cc.director.getScheduler().schedule(this.nextLivePoint, this, 0.01);
    },

    stopLive: function() {
        cc.director.getScheduler().unschedule(this.nextLivePoint, this)
    },

    nextLivePoint: function() {
        let lineIdx = this.liveLineCurr;
        let pointIdx = this.livePointCurr;

        // 检测是否有可播放的内容
        if (lineIdx >= this.livePoints.length) {
            return;
        }
        if (pointIdx >= this.livePoints[lineIdx].points.length) {
            return;
        }

        let line = this.livePoints[lineIdx];
        let points = line.points.slice(0, pointIdx+1);

        // 笔画的第一个点
        if (pointIdx == 0) {
            this.livePath = this.group.addPath();
            this.livePath.fillColor = 'none';
            this.livePath.strokeColor = cc.hexToColor(line.color);
            this.livePath.lineWidth = line.width;
        }
        this.livePath.points(points);

        pointIdx++;

        if (pointIdx >= this.livePoints[lineIdx].points.length && lineIdx < this.livePoints.length) {
            pointIdx = 0;
            lineIdx++;
        }

        this.liveLineCurr = lineIdx;
        this.livePointCurr = pointIdx;
    },

    onTouchBegan: function (touch, event) {
        // 画图功能未开启
        if (!this.enableDraw) {
            return;
        }

        var touchLoc = touch.getLocation();
        touchLoc = this.node.parent.convertToNodeSpaceAR(touchLoc);
        touchLoc = util.subPoint(touchLoc, this.node.position);

        this.path = this.group.addPath();
        this.path.fillColor = this.drawAttr.fillColor;
        this.path.strokeColor = this.drawAttr.strokeColor;
        this.path.lineWidth = this.drawAttr.lineWidth;
        this.path.showHandles = this.drawAttr.debug;

        this.points = [touchLoc];
    },

    onTouchMoved: function (touch, event) {
        // 画图功能未开启
        if (!this.enableDraw) {
            return;
        }

        var touchLoc = touch.getLocation();
        touchLoc = this.node.parent.convertToNodeSpaceAR(touchLoc);
        touchLoc = util.subPoint(touchLoc, this.node.position);

        this.points.push(touchLoc);
        this.path.points(this.points);
    },

    onTouchEnded: function (touch, event) {
        let attr = this.drawAttr;

        // 画图功能未开启
        if (!this.enableDraw) {
            return;
        }

        if (this.points.length < 2) {
            return;
        }

        // 加入到历史笔画
        this.histPoints.push({
            attr: {
                lineWidth: attr.lineWidth,
                strokeColor: cc.colorToHex(attr.strokeColor),
            },
            points: util.clone(this.points),
        });

        // 提交笔画
        ideal.conn.send('draw', {
            line: {
                points: this.points,
                width: attr.lineWidth,
                color: cc.colorToHex(attr.strokeColor),
            }
        });

        this.points.length = 0;
        this.enableDraw = false;
    },

    // [回馈]笔画
    onDrawFb: function(data) {
        this.enableDraw = true;

        // 划线失败, 清除本次提交的笔画
        let result = data.result;
        if (result.code != 0) {
            this.path.points([{x:0, y:0}, {x:0, y:0}]);
            return;
        }
    },
});
