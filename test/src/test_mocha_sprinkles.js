const fs = require("fs");
const path = require("path");
const Promise = require("bluebird");
const shell = require("shelljs");
const should = require("should");
const sprinkles = require("../../lib/mocha-sprinkles");
const util = require("util");

require("source-map-support").install();

describe("futureTest", () => {
  it("succeeds in the future", (done) => {
    let finished = false;
    const myDone = (error) => {
      finished = true;
    };
    const f = () => Promise.delay(10).then(() => "hello");
    return sprinkles.future(f)(myDone).then(() => {
      finished.should.eql(true);
      done();
    });
  });

  it("fails in the future", (done) => {
    let finished = false;
    const myDone = (error) => {
      finished = error;
    };
    const f = () => Promise.reject(new Error("HALP"));
    return sprinkles.future(f)(myDone).then(() => {
      finished.message.should.match(/HALP/);
      done();
    });
  });
});

describe("withTempFolder", () => {
  it("creates a temporary folder", () => {
    let myFolder = null;
    const myDone = (error) => null;
    const f = (folder) => {
      myFolder = folder;
      fs.writeFileSync(`${myFolder}/alive.x`, "alive!");
      fs.existsSync(`${myFolder}/alive.x`).should.eql(true);
      return Promise.resolve(true);
    };
    return sprinkles.withTempFolder(f)(myDone).then(() => {
      fs.existsSync(`${myFolder}`).should.eql(false);
      fs.existsSync(`${myFolder}/alive.x`).should.eql(false);
    });
  });
});

describe("exec", () => {
  it("succeeds", () => {
    return sprinkles.exec("echo hello").then((result) => {
      result.stdout.should.match(/hello/);
    });
  });

  it("fails", () => {
    let failed = false;
    return sprinkles.exec("wtfbbqsalad").catch((error) => {
      failed = true;
    }).then(() => {
      failed.should.eql(true);
    });
  });
});
