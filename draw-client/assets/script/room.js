cc.Class({
    extends: cc.Component,

    properties: {
        prefabUserItem: cc.Prefab,
        layout: cc.Node,
    },

    onLoad: function () {
        window.kk = this;
    	this.init();
    	this.bindEvents();
    },

    onDestroy: function() {
    	this.unbindEvent();
    },

    bindEvents: function() {
        ideal.conn.on('match.success', this.onMatchFb, this);
        ideal.conn.on('push.join_room', this.onJoinRoom, this);
    	ideal.conn.on('push.leave_room', this.onLeaveRoom, this);
    },

    unbindEvent: function() {
        ideal.conn.off('match.success', this.onMatchFb);
        ideal.conn.off('push.join_room', this.onJoinRoom);
        ideal.conn.off('push.leave_room', this.onLeaveRoom);
    },

    init: function() {
        ideal.init(function() {
            util.log('%-#0fe029', 'ideal framework initialization end.');

            // 登录, 并由系统分配到一个新的房间
            ideal.conn.send('login', ideal.data.user);
        }.bind(this));
    },

    onStart: function() {
        cc.director.loadScene('main');
    },

    onMatchFb: function(data) {
        // 保存房间信息
        ideal.data.room = data;

        this.updateUserList();
    },

    onJoinRoom: function(data) {
        // 保存房间信息
        ideal.data.room = data;

        this.updateUserList();
    },

    onLeaveRoom: function(data) {
        // 保存房间信息
        ideal.data.room = data;

        this.updateUserList();
    },

    updateUserList: function() {
        // 清空子节点
        this.layout.removeAllChildren();

        let userlist = ideal.data.room.userlist;
        for (let i in userlist) {
            let prefabItem = cc.instantiate(this.prefabUserItem);
            prefabItem.parent = this.layout;
            prefabItem.getComponent('user-item').load(userlist[i]);
        };
    },
});
