/* See README.md */
var forkExecWaitShell = require('../lib/forkexec').forkExecWaitShell;
forkExecWaitShell({
    'command': 'sleep 2',
    'timeout': 1000
}, function (err, info) {
	console.log(info);
});
