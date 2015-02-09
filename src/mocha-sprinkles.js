let child_process = require("child_process");
let fs = require("fs");
let Promise = require("bluebird");
let shell = require("shelljs");
let util = require("util");

// run a test as a future, and call mocha's 'done' method at the end of the chain.
exports.future = (f) => {
  return (done) => {
    return f().then(() => done(), (error) => done(error));
  }
}

exports.withTempFolder = (f) => {
  return (...x) => {
    let uniq = null
    let tries = 0
    while (true) {
      tries += 1;
      uniq = `/tmp/mocha-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
      try {
        fs.mkdirSync(uniq, 7 << 6);
        break;
      } catch (error) {
        if (tries >= 5) throw new Error(`Unable to create temporary folder: ${error}`);
        // try again with a different folder name
      }
    }
    // save old cwd, to restore afterwards, and cd into the temp folder.
    let oldCwd = process.cwd();
    process.chdir(uniq);
    // sometimes (especially on macs), the real folder name will be different.
    let realname = process.cwd();
    return f(realname, ...x).finally(() => {
      process.chdir(oldCwd);
      shell.rm("-r", uniq);
    });
  };
};

// run a command & wait for it to end.
exports.exec = (command, options={}) => {
  let deferred = Promise.defer();
  let p = child_process.exec(command, options, (error, stdout, stderr) => {
    if (error) {
      error.process = p;
      error.stdout = stdout;
      error.stderr = stderr;
      deferred.reject(error);
    } else {
      deferred.resolve({ process: p, stdout: stdout, stderr: stderr });
    }
  });
  return deferred.promise;
};
