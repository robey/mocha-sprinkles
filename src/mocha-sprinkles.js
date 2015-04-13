const child_process = require('child_process');
const fs = require('fs');
const Promise = require('bluebird');
const shell = require('shelljs');
const util = require('util');

// run a test as a future, and call mocha's 'done' method at the end of the chain.
exports.future = (f) => {
  return (done) => {
    return f().then(() => done(), (error) => done(error));
  };
};

exports.withTempFolder = (f) => {
  return (...args) => {
    let uniq = null;
    let tries = 0;
    while (true) {
      tries += 1;
      uniq = `/tmp/mocha-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
      try {
        fs.mkdirSync(uniq, 0x1c0);
        break;
      } catch (error) {
        if (tries >= 5) throw new Error(`Unable to create temporary folder: ${e}`);
        // try again with a different folder name
      }
    }
    // save old cwd, to restore afterwards, and cd into the temp folder.
    const oldCwd = process.cwd();
    process.chdir(uniq);
    // sometimes (especially on macs), the real folder name will be different.
    const realname = process.cwd();
    return f(realname, ...args).finally(() => {
      process.chdir(oldCwd);
      shell.rm("-r", uniq);
    });
  };
};

// run a command & wait for it to end.
exports.exec = (command, options = {}) => {
  return new Promise((resolve, reject) => {
    const p = child_process.exec(command, options, (error, stdout, stderr) => {
      if (error) {
        error.process = p;
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
      } else {
        resolve({ process: p, stdout: stdout, stderr: stderr });
      }
    });
  });
};
