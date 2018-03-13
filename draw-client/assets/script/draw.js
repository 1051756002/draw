cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad: function () {
        this.group = this.addComponent('R.group');

        // 画板属性
        this.drawAttr = {
            debug: false,
            fillColor: 'none',
            lineWidth: 5,
            strokeColor: cc.hexToColor('#000'),
        };

        this.histPoints = [];

        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchBegan, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoved, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnded, this);

        window.kk = this;
    },

    onTouchBegan: function (touch, event) {
        var touchLoc = touch.getLocation();
        touchLoc = this.node.parent.convertToNodeSpaceAR(touchLoc);
        touchLoc = util.subPoint(touchLoc, this.node.position);

        this.path = this.group.addPath();
        this.path.fillColor = this.drawAttr.fillColor;
        this.path.strokeColor = this.drawAttr.strokeColor;
        this.path.lineWidth = this.drawAttr.lineWidth;
        this.path.showHandles = this.drawAttr.debug;

        this.points = [touchLoc];

        return true;
    },

    onTouchMoved: function (touch, event) {
        var touchLoc = touch.getLocation();
        touchLoc = this.node.parent.convertToNodeSpaceAR(touchLoc);
        touchLoc = util.subPoint(touchLoc, this.node.position);

        this.points.push(touchLoc);
        this.path.points(this.points);
    },

    onTouchEnded: function (touch, event) {
        let attr = this.drawAttr;

        this.histPoints.push({
            attr: {
                lineWidth: attr.lineWidth,
                strokeColor: attr.strokeColor.toCSS(),
            },
            points: util.clone(this.points),
        });
        util.log({
            attr: {
                lineWidth: attr.lineWidth,
                strokeColor: attr.strokeColor.toCSS(),
            },
            points: this.points
        });

        this.path.points(this.points);
        this.points.length = 0;
    },
});
