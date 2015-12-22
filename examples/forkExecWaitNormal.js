/* See README.md */
var forkExecWaitShell = require('../lib/forkexec').forkExecWaitShell;
forkExecWaitShell({
    'command': 'echo hello world'
}, function (err, info) {
	console.log(info);
});
