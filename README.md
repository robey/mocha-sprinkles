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

Wrap a test function that returns a future. Mocha's `done` hooks are attached to the future so that the test doesn't complete until the future is resolved.

```javascript
it("waits 100 ms", future(function () {
  return Q.delay(100);
}));
```

### withTempFolder

Wrap a test function so that it runs inside a temporary folder. The folder's name is passed as the first parameter, and the test is expected to return a future. When the future is resolved, the temporary folder is deleted (along with any contents).

This function requires `future` also, since the cleanup is attached to the result future.

```javascript
it("creates a file", future(withTempFolder(function (folder) {
  fs.writeFileSync(folder + "/new-file", "hello!");
})));
```

### exec(command, options)

Execute a program as a future. The parameters are passed to `child_process.exec` as-is and a future is returned. If the exec is successful, the future is resolved with an object with these fields:

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
