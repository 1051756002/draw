cc.Class({
    extends: cc.Component,

    properties: {
        prefabUserItem: cc.Prefab,
        layout: cc.Node,
        btnPlay: cc.Button,
        btnReady: cc.Button,
    },

    onLoad: function () {
    	this.init();
    	this.bindEvents();
    },

    onDestroy: function() {
    	this.unbindEvent();
    },

    bindEvents: function() {
        ideal.conn.on('match.success', this.onMatchFb, this);
        ideal.conn.on('play.feedback', this.onPlayFb, this);
        ideal.conn.on('ready.feedback', this.onReadyFb, this);
        ideal.conn.on('unready.feedback', this.onUnReadyFb, this);
        ideal.conn.on('push.join_room', this.onJoinRoom, this);
    	ideal.conn.on('push.leave_room', this.onLeaveRoom, this);
        ideal.conn.on('push.play', this.onPushPlay, this);
        ideal.conn.on('push.ready', this.onPushReady, this);
        ideal.conn.on('push.unready', this.onPushUnReady, this);
    },

    unbindEvent: function() {
        ideal.conn.off('match.success', this.onMatchFb);
        ideal.conn.off('play.feedback', this.onPlayFb);
        ideal.conn.off('ready.feedback', this.onReadyFb);
        ideal.conn.off('unready.feedback', this.onUnReadyFb);
        ideal.conn.off('push.join_room', this.onJoinRoom);
        ideal.conn.off('push.leave_room', this.onLeaveRoom);
        ideal.conn.off('push.play', this.onPushPlay);
        ideal.conn.off('push.ready', this.onPushReady);
        ideal.conn.off('push.unready', this.onPushUnReady);
    },

    init: function() {
        ideal.init(function() {
            util.log('%-#0fe029', 'ideal framework initialization end.');

            // 登录, 并由系统分配到一个新的房间
            ideal.conn.send('login', ideal.data.user);
        }.bind(this));
    },

    onPlay: function() {
        ideal.conn.send('play');
        this.btnPlay.interactable = false;
    },

    onReady: function() {
        let username = ideal.data.user.username;
        let userlist = ideal.data.room.userlist;
        let ruser = util.okey(userlist, 'username', username);

        // 房主
        if (ruser.identity == 1) {
            return;
        }

        if (ruser.status == 1) {
            ideal.conn.send('unready');
        } else {
            ideal.conn.send('ready');
        }
        this.btnReady.interactable = false;
    },

    // 房间匹配回调
    onMatchFb: function(data) {
        // 保存房间信息
        ideal.data.room = data;

        this.updateButton();
        this.updateUserList();
    },

    onPlayFb: function(data) {
        this.btnPlay.interactable = true;

        // 请求失败
        let result = data.result;
        if (result.code != 0) {
            util.log(result);
            return;
        }

        cc.director.loadScene('main');
    },

    onReadyFb: function(data) {
        this.btnReady.interactable = true;

        // 请求失败
        let result = data.result;
        if (result.code != 0) {
            util.log(result);
            return;
        }

        let username = ideal.data.user.username;
        let userlist = ideal.data.room.userlist;
        let ruser = util.okey(userlist, 'username', username);

        // 准备状态
        ruser.status = 1;

        this.updateButton();
        this.updateUserList();
    },

    onUnReadyFb: function(data) {
        this.btnReady.interactable = true;

        // 请求失败
        let result = data.result;
        if (result.code != 0) {
            util.log(result);
            return;
        }

        let username = ideal.data.user.username;
        let userlist = ideal.data.room.userlist;
        let ruser = util.okey(userlist, 'username', username);

        // 取消状态
        ruser.status = 0;

        this.updateButton();
        this.updateUserList();
    },

    onJoinRoom: function(data) {
        // 保存房间信息
        ideal.data.room = data;

        this.updateButton();
        this.updateUserList();
    },

    onLeaveRoom: function(data) {
        // 保存房间信息
        ideal.data.room = data;

        this.updateButton();
        this.updateUserList();
    },

    onPushPlay: function(data) {
        // 保存房间信息
        ideal.data.room = data;

        this.updateButton();
        this.updateUserList();
        
        cc.director.loadScene('main');
    },

    onPushReady: function(data) {
        // 保存房间信息
        ideal.data.room = data;

        this.updateUserList();
    },

    onPushUnReady: function(data) {
        // 保存房间信息
        ideal.data.room = data;

        this.updateUserList();
    },

    updateButton: function() {
        let username = ideal.data.user.username;
        let userlist = ideal.data.room.userlist;
        let ruser = util.okey(userlist, 'username', username);

        // 房主
        if (ruser.identity == 1) {
            this.btnPlay.node.active = true;
            this.btnReady.node.active = false;
        } else {
            this.btnPlay.node.active = false;
            this.btnReady.node.active = true;

            let lblReady = cc.find('Label', this.btnReady.node);
            lblReady = lblReady.getComponent(cc.Label);
            lblReady.string = ruser.status == 1 ? '取消' : '准备';
        }
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
