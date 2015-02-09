let fs = require("fs");
let path = require("path");
let Promise = require("bluebird");
let shell = require("shelljs");
let should = require("should");
let util = require("util");

let sprinkles = require("../../lib/mocha-sprinkles");

describe("futureTest", () => {
  it("succeeds in the future", (done) => {
    let finished = false
    let myDone = (error) => {
      finished = true
    };
    let f = () => Promise.delay(10).then(() => "hello");
    return sprinkles.future(f)(myDone).then(() => {
      finished.should.eql(true);
      done();
    });
  });

  it("fails in the future", (done) => {
    let finished = false;
    let myDone = (error) => {
      finished = error;
    };
    let f = () => Promise.reject(new Error("HALP"));
    return sprinkles.future(f)(myDone).then(() => {
      finished.message.should.match(/HALP/);
      done();
    });
  });
});

describe("withTempFolder", () => {
  it("creates a temporary folder", () => {
    let myFolder = null;
    let myDone = (error) => null;
    let f = (folder) => {
      myFolder = folder;
      fs.writeFileSync(`${myFolder}/alive.x`, "alive!");
      fs.existsSync(`${myFolder}/alive.x`).should.eql(true);
      return Promise.resolve(true);
    };
    sprinkles.withTempFolder(f)(myDone).then(() => {
      fs.existsSync(`${myFolder}`).should.eql(false);
      fs.existsSync(`${myFolder}/alive.x`).should.eql(false);
    });
  });
});

describe("exec", () => {
  it("succeeds", () => {
    sprinkles.exec("echo hello").then((result) => {
      result.stdout.should.match(/hello/);
    });
  });

  it("fails", () => {
    let failed = false;
    sprinkles.exec("wtfbbqsalad").catch((error) => {
      failed = true;
    }).then(() => {
      failed.should.eql(true);
    });
  });
});
