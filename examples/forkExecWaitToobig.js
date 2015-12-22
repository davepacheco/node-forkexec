/* See README.md */
var forkExecWait = require('../lib/forkexec').forkExecWait;
forkExecWait({
    'argv': [ 'echo', 'hello', 'world' ],
    'maxBuffer': 5
}, function (err, info) {
	console.log(err, info);
});
