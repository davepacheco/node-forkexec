# forkexec: sane child process library

This library provides somewhat saner interfaces to Node's
[child_process](https://nodejs.org/api/child_process.html) module.  It's still
growing, and most of the interfaces there don't have analogs here yet.

The interfaces in this library conform to Joyent's [Best Practices for Error
Handling in Node.js](http://www.joyent.com/developers/node/design/errors).  Most
notably:

* most arguments are passed via named properties of an "args" object, and
* passing invalid arguments into the library results in thrown exceptions that
  _should not be caught_.  Don't pass bad values in.

Operational errors are emitted asynchronously.

The only interfaces currently provided are:

* [forkExecWait](#forkexecwait-forkexecwaitshell)`(args, callback)`: like
  `child_process.execFile`, but all operational errors are emitted
  asynchronously, errors are more descriptive, and there's a crisper summary of
  exactly what happened.
* [forkExecWaitShell](#forkexecwait-forkexecwaitshell)`(args, callback)`: like
  `child_process.exec`, but all operational errors are emitted asynchronously,
  errors are more descriptive, and there's a crisper summary of exactly what
  happened.


## forkExecWait, forkExecWaitShell

`forkExecWait` is like the built-in `child_process.execFile`.  This function
forks a child process, exec's the requested command, waits for it to exit, and
captures the full stdout and stderr.  The file to be executed should be an
executable on the caller's PATH.  It is _not_ passed through the shell as would
happen with `child_process.exec`.

`forkExecWaitShell` is like `forkExecWait`, except that you specify the command
as a single string that will be passed to the shell (similar to `sh -c`).  This
is more like Node's `child_process.exec`.

It's recommended to use `forkExecWaitShell` if you intend to use shell features
like pipelines or environment variables directly in the command line, and to use
`forkExecWait` otherwise.  (`forkExecWait` is particularly easier to deal with
when arguments may contain whitespace, since otherwise you must be mindful of
how shell quoting rules.)


### Arguments

```javascript
forkExecWait(args, callback)
forkExecWaitShell(args, callback)
```

For `forkExecWait`, the required named argument is:

* **argv** (array of string): command-line arguments, _including the command
  name itself_.  If you want to run "ls -l", this should be `[ 'ls', '-l' ]`.
  (This is different than Node's `execFile`, but more consistent with underlying
  system interfaces.)

For `forkExecWaitShell`, the required named argument is:

* **command** (string): shell command to execute.

For both commands, the following optional arguments have the same semantics as
for Node's built-in `child_process.execFile` except where otherwise noted:

* **timeout** (int: milliseconds): maximum time the child process may run before
  SIGKILL will be sent to it.  If 0, then there is no timeout.  (Note that Node
  lets you override the signal used and defaults to SIGTERM.  This interface
  always uses SIGKILL.)
* **cwd** (string): working directory
* **encoding** (string): encoding for stdout and stderr
* **env** (object): environment variables
* **maxBuffer** (int): bytes of stdout and stderr that will be buffered.  If
  this is exceeded, the child process will be killed with SIGKILL.
* **uid** (int): uid for child process
* **gid** (int): gid for child process


### Errors

Operational errors include:

* Any of the fork/exec failures described below.
* MaxBufferExceeded: the contents of "stdout" or "stderr" from the child process
  exceeded `maxBuffer` bytes.  In this case, the child process will be sent
  SIGKILL.


### Return value

The return value is the same as `child_process.execFile` except when that
function would throw an exception, in which case this function will return
`null` and the error that would have been thrown is instead emitted to the
callback (as you'd probably have expected Node to do).


### Callback

The callback is invoked as `callback(err, info)`, where `info` always has
properties:

* **error**: same as the callback argument (null on success, a descriptive error
  on failure)
* **status**: the wait(2) numeric status code if the child process exited
  normally, and null otherwise.
* **signal**: the name of the signal that terminated the child process, or null
  if the process never exec'd or exited normally
* **stdout**: the string contents of the command's stdout.  This is unspecified
  if the process was not successfully exec'd.
* **stderr**: the string contents of the command's stderr.  This is unspecified
  if the process was not successfully exec'd.


### Examples

Normal command:

```javascript
forkExecWait({
    'argv': [ 'echo', 'hello', 'world' ]
}, function (err, info) {
    console.log(info);
});
```

```javascript
{ error: null,
  status: 0,
  signal: null,
  stdout: 'hello world\n',
  stderr: '' }
```

Successful fork/exec, command fails:

```javascript
forkExecWait({
    'argv': [ 'grep', 'foobar' '/nonexistent_file' ]
}, function (err, info) {
    console.log(info);
});
```

```javascript
{ error: 
   { [VError: exec "grep foobar /nonexistent_file": exited with status 2]
     jse_shortmsg: 'exec "grep foobar /nonexistent_file"',
     jse_summary: 'exec "grep foobar /nonexistent_file": exited with status 2',
     jse_cause: 
      { [VError: exited with status 2]
        jse_shortmsg: 'exited with status 2',
        jse_summary: 'exited with status 2',
        message: 'exited with status 2' },
     message: 'exec "grep foobar /nonexistent_file": exited with status 2' },
  status: 2,
  signal: null,
  stdout: '',
  stderr: 'grep: /nonexistent_file: No such file or directory\n' }
```

Failed fork/exec: command not found:

```javascript
forkExecWait({
    'argv': [ 'nonexistent', 'command' ]
}, function (err, info) {
    console.log(info);
});
```

```javascript
{ error: 
   { [VError: exec "nonexistent command": spawn nonexistent ENOENT]
     jse_shortmsg: 'exec "nonexistent command"',
     jse_summary: 'exec "nonexistent command": spawn nonexistent ENOENT',
     jse_cause: 
      { [Error: spawn nonexistent ENOENT]
        code: 'ENOENT',
        errno: 'ENOENT',
        syscall: 'spawn nonexistent',
        path: 'nonexistent',
        cmd: 'nonexistent command' },
     message: 'exec "nonexistent command": spawn nonexistent ENOENT' },
  status: null,
  signal: null,
  stdout: '',
  stderr: '' }
```

Failed fork/exec: command is not executable (note: Node throws on this, while
this library emits an error asynchronously, since this is an operational error):

```javascript
forkExecWait({
    'argv': [ '/dev/null' ]
}, function (err, info) {
    console.log(info);
});
```

```javascript
{ error: 
   { [VError: exec "/dev/null": spawn EACCES]
     jse_shortmsg: 'exec "/dev/null"',
     jse_summary: 'exec "/dev/null": spawn EACCES',
     jse_cause: { [Error: spawn EACCES] code: 'EACCES', errno: 'EACCES', syscall: 'spawn' },
     message: 'exec "/dev/null": spawn EACCES' },
  status: null,
  signal: null,
  stdout: '',
  stderr: '' }
```

Command times out (killed by our SIGKILL after 3 seconds):

```javascript
forkExecWait({
    'argv': [ 'sleep', '4' ],
    'timeout': 3000,
}, function (err, info) {
    console.log(info);
});
```

```javascript
{ error: 
   { [VError: exec "sleep 2": unexpectedly terminated by signal SIGKILL]
     jse_shortmsg: 'exec "sleep 2"',
     jse_summary: 'exec "sleep 2": unexpectedly terminated by signal SIGKILL',
     jse_cause: 
      { [VError: unexpectedly terminated by signal SIGKILL]
        jse_shortmsg: 'unexpectedly terminated by signal SIGKILL',
        jse_summary: 'unexpectedly terminated by signal SIGKILL',
        message: 'unexpectedly terminated by signal SIGKILL' },
     message: 'exec "sleep 2": unexpectedly terminated by signal SIGKILL' },
  status: null,
  signal: 'SIGKILL',
  stdout: '',
  stderr: '' }
```


## Fork/exec error handling

There are four possible outcomes after successfully invoking this interface:

1. Node failed to fork/exec the child process at all.
   (`error` is non-null, `status` is null, and `signal` is null)
2. The child process was successfully forked and exec'd, but terminated
   abnormally due to a signal.
   (`error` is non-null, `status` is null, and `signal` is non-null)
3. The child process was successfully forked and exec'd and exited
   with a status code other than 0.
   (`error` is non-null, `status` is an integer, and `signal` is null).
4. The child process was successfully forked and exec'd and exited with
   a status code of 0.
   (`error` is null, `status` is 0, and `signal` is null.)

While this interface allows callers to easily tell which of these four cases
occurred, most programs only need to think of this as either success (case (4))
or failure (cases (1) through (3)).  This corresponds exactly to whether "error"
is non-null.  Generating a descriptive error message for the three error cases
is non-trivial.  You should probably just use the message provided on the Error.

# Contributions

Contributions welcome.  Code should be "make prepush" clean.  To run "make
prepush", you'll need these tools:

* https://github.com/davepacheco/jsstyle
* https://github.com/davepacheco/javascriptlint

If you're changing something non-trivial or user-facing, you may want to submit
an issue first.
