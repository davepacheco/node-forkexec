var assert = require('assert-plus');
var forkExecWaitShell = require('../lib/forkexec').forkExecWaitShell;

var done = false;
process.on('exit', function () { assert.ok(done); });

forkExecWaitShell({
    'command': '/dev/null'
}, function (err, info) {
	console.log(info);
	assert.ok(!done);
	done = true;
	assert.ok(err instanceof Error);
	assert.ok(info.error == err);
	/* JSSTYLED */
	assert.ok(/^exec "\/bin\/sh" "-c" "\/dev\/null":/.test(err.message));
	assert.ok(info.status === 126);
	assert.ok(info.signal === null);
	assert.ok(info.stdout === '');
	assert.ok(info.stderr ===
	    '/bin/sh: line 1: /dev/null: cannot execute [Permission denied]\n');
});
