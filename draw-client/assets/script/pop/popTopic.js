cc.Class({
    extends: require('./basePop'),

    properties: {
    	toggles: {
    		default: [],
    		type: cc.Toggle,
    	},
    },

    onLoad: function() {
    	this.bindEvents();
    },

    onDestroy: function() {
        this.unbindEvent();
    },

    bindEvents: function() {
        ideal.conn.on('choice.success', this.onChoiceFb, this);
    },

    unbindEvent: function() {
        ideal.conn.off('choice.success', this.onChoiceFb);
    },

    init: function(data) {
    	// 选中的索引
    	this.checkedIdx = 0;
    	this.questionlist = data.questionlist;

    	this.renderQuestionList();
    },

    // 渲染题目列表
    renderQuestionList: function() {
    	let qlist = this.questionlist;
    	for (let i = 0; i < 3; i++) {
    		// 答案
    		let lblAnswer = cc.find('lbl_answer', this.toggles[i].node);
    		lblAnswer.getComponent(cc.Label).string = qlist[i].answer;
    		// 暗示
    		let lblHint = cc.find('lbl_hint', this.toggles[i].node);
    		lblHint.getComponent(cc.Label).string = qlist[i].hint;
    	}
    },

    onToggleChecked: function(toggle) {
        this.checkedIdx  = this.toggles.indexOf(toggle);
    },

    // [请求]选题
    onChoice: function() {
    	let question = this.questionlist[this.checkedIdx];

    	ideal.conn.send('choice', { questionid: question.id });
    },

    // [回馈]选题
    onChoiceFb: function(data) {
    	this.onClose();
    },
});
