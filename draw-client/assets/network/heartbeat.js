let heartbeat = {};
let stid_beat = 0;

// 最后时间
let lastTime = 0;
// 发送时间
let sendTime = 0;

heartbeat.start = function() {
	this.next();

	ideal.conn.on('beat', this.beat, this);
};

heartbeat.beat = function() {
	// util.log('du ~');
	lastTime = Date.now();
};

heartbeat.next = function() {
	let currTime = Date.now();

	lastTime || (lastTime = currTime);
	sendTime || (sendTime = currTime);

	if ((currTime - lastTime) > 5000 || (currTime - sendTime) > 5000) {
		sendTime = undefined;
		ideal.conn.interrupt();
		return;
	}

	ideal.conn.send('beat');
	sendTime = currTime;

	stid_beat = setTimeout(this.next.bind(this), 1000);
};

heartbeat.stop = function() {
	clearTimeout(stid_beat);
	ideal.conn.off('beat');
};

module.exports = heartbeat;