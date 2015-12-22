/* See README.md */
var forkExecWaitShell = require('../lib/forkexec').forkExecWaitShell;
forkExecWaitShell({
    'command': '/dev/null'
}, function (err, info) {
	console.log(info);
});
