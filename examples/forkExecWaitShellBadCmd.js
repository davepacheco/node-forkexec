/* See README.md */
var forkExecWaitShell = require('../lib/forkexec').forkExecWaitShell;
forkExecWaitShell({
    'command': 'nonexistent command'
}, function (err, info) {
	console.log(info);
});
