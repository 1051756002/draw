cc.Class({
    extends: cc.Component,

    properties: {
        layDraw: cc.Node,
        layPalette: cc.Node,
        btnPalette: cc.Button,

        // 是否显示工具栏
        displayPalette: {
            default: false,
            visible: false,
        },
    },

    onLoad: function () {
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

        var drawAttr = this.layDraw.getComponent('draw').drawAttr;
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

    onClean: function() {
        var draw = this.layDraw.getComponent('draw');

        draw.group.children.length = 0;
        draw.group.ctx.clear();
    },
});
