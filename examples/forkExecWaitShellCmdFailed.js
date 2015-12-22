/* See README.md */
var forkExecWaitShell = require('../lib/forkexec').forkExecWaitShell;
forkExecWaitShell({
    'command': 'grep foobar /nonexistent_file'
}, function (err, info) {
	console.log(info);
});
