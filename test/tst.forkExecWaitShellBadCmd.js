var assert = require('assert-plus');
var forkExecWaitShell = require('../lib/forkexec').forkExecWaitShell;

var done = false;
process.on('exit', function () { assert.ok(done); });

forkExecWaitShell({
    'command': 'nonexistent command'
}, function (err, info) {
	console.log(info);
	assert.ok(!done);
	done = true;
	assert.ok(err instanceof Error);
	assert.ok(info.error == err);
	assert.ok(
	    /* JSSTYLED */
	    /^exec "\/bin\/sh" "-c" "nonexistent command":/.test(err.message));
	assert.ok(info.status === 127);
	assert.ok(info.signal === null);
	assert.ok(info.stdout === '');
	assert.ok(info.stderr === '/bin/sh: line 1: nonexistent: not found\n');
});
