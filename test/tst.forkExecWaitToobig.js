var assert = require('assert-plus');
var forkExecWait = require('../lib/forkexec').forkExecWait;

var done = false;
process.on('exit', function () { assert.ok(done); });

forkExecWait({
    'argv': [ 'echo', 'hello', 'world' ],
    'maxBuffer': 5
}, function (err, info) {
	console.log(info);
	assert.ok(!done);
	done = true;
	assert.ok(err instanceof Error);
	assert.ok(info.error == err);
	assert.equal(err.message,
	    'exec "echo" "hello" "world": stdout maxBuffer exceeded.');
	assert.ok(info.status === null);
	/*
	 * Node sends the process SIGKILL, but does not actually report that
	 * back to us.
	 */
	assert.ok(info.signal === null);
	/*
	 * We can't assume much about stdout.
	 */
	assert.ok(info.stderr === '');
});
