var assert = require('assert-plus');
var forkExecWaitShell = require('../lib/forkexec').forkExecWaitShell;

var done = false;
process.on('exit', function () { assert.ok(done); });

forkExecWaitShell({
    'command': 'sleep 2',
    'timeout': 1000
}, function (err, info) {
	console.log(info);
	assert.ok(!done);
	done = true;
	assert.ok(err instanceof Error);
	assert.ok(info.error == err);
	assert.equal(err.message,
	    'exec "/bin/sh" "-c" "sleep 2": unexpectedly terminated ' +
	    'by signal SIGKILL');
	assert.ok(info.status === null);
	assert.equal(info.signal, 'SIGKILL');
	assert.ok(info.stdout === '');
	assert.ok(info.stderr === '');
});
