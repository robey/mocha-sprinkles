mocha-sprinkles
===============

These are a few small helpers for mocha, that simplify your test boilerplate if you use bluebird.

Each function is intended to be a mixin for a unit test, so for example, if you have a test like this:

```javascript
it("adds numbers", function () {
  (2 + 2).should.eql(4);
});
```

you can add each helper as a wrapper around the test function, like this:

```javascript
it("adds numbers", function () {
  Promise.resolve(2 + 2).then(function (sum) {
    sum.should.eql(4);
  });
});
```


The helpers
-----------

### future

Wrap a test function that returns a future:

- `future(function)`
  - `function`: `() => Promise` code to execute as a test

Mocha's `done` hooks are attached to the future so that the test doesn't complete until the future is resolved.

```javascript
it("waits 100 ms", future(function () {
  return Q.delay(100);
}));
```

### withTempFolder

Wrap a test function so that it runs inside a temporary folder:

- `withTempFolder(function)`
  - `function`: `(folder) => Promise` code to execute while the folder exists

The folder's name is passed as the first parameter to the function, and it's expected to return a Promise. When the Promise is resolved, the temporary folder is deleted (along with any contents).

This function requires `future` also, since the cleanup is attached to the result future.

```javascript
it("creates a file", future(withTempFolder(function (folder) {
  fs.writeFileSync(folder + "/new-file", "hello!");
})));
```

### exec

Execute a program as a future:

- `exec(command, options)`
  - `command`: passed to `child_process.exec`
  - `options`: passed to `child_process.exec`

The parameters are passed to `child_process.exec` as-is and a future is returned. If the exec is successful, the future is resolved with an object with these fields:

- process: the process object
- stdout: the stdout buffer
- stderr: the stderr buffer

If the exec fails, the future is rejected, and the error object will have those three fields added to it.

```javascript
it("runs echo", future(function () {
  return exec("echo hello").then(function (result) {
    result.stdout.should.match(/hello/);
  });
}));
```

### eventually

Try running assertions a few times, until they pass (or run out of time):

- `eventually(options, function)`
  - `options`:
    - `timeout`: milliseconds to wait before giving up (default: 1000)
    - `frequency`: milliseconds to wait between attempts (default: 50)
  - `function`: code to execute on each attempt

To assert that a background process will have some effect in a non-deterministic (but relatively short) time, you can group your assertions in an `eventually` block. If an exception is thrown the first time -- for example, by a failing assertion -- it will delay for a small period of time, then try again, repeating until the code executes without exception or the time runs out.
