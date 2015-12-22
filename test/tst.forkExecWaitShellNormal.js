var assert = require('assert-plus');
var forkExecWaitShell = require('../lib/forkexec').forkExecWaitShell;

var done = false;
process.on('exit', function () { assert.ok(done); });

forkExecWaitShell({
    'command': 'echo hello world | cat -n'
}, function (err, info) {
	console.log(info);
	assert.ok(!done);
	done = true;
	assert.ok(err === null);
	assert.ok(info.error === null);
	assert.ok(info.status === 0);
	assert.ok(info.signal === null);
	assert.ok(info.stdout === '     1\thello world\n');
	assert.ok(info.stderr === '');
});
