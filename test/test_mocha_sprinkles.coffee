fs = require 'fs'
path = require 'path'
Promise = require 'bluebird'
shell = require 'shelljs'
should = require 'should'
util = require 'util'

sprinkles = require("../lib/mocha-sprinkles")

describe "futureTest", ->
  it "succeeds in the future", (done) ->
    finished = false
    myDone = (error) ->
      finished = true
    f = -> Promise.delay(10).then -> "hello"
    sprinkles.future(f)(myDone).then ->
      finished.should.eql true
      done()

  it "fails in the future", (done) ->
    finished = false
    myDone = (error) ->
      finished = error
    f = -> Promise.reject(new Error("HALP"))
    sprinkles.future(f)(myDone).then ->
      finished.message.should.match /HALP/
      done()

describe "withTempFolder", ->
  it "creates a temporary folder", ->
    myFolder = null
    myDone = (error) ->
    f = (folder) ->
      myFolder = folder
      fs.writeFileSync("#{myFolder}/alive.x", "alive!")
      fs.existsSync("#{myFolder}/alive.x").should.eql(true)
      Promise.resolve(true)
    sprinkles.withTempFolder(f)(myDone).then ->
      fs.existsSync("#{myFolder}").should.eql(false)
      fs.existsSync("#{myFolder}/alive.x").should.eql(false)

describe "exec", ->
  it "succeeds", ->
    sprinkles.exec("echo hello").then (result) ->
      result.stdout.should.match /hello/

  it "fails", ->
    failed = false
    sprinkles.exec("wtfbbqsalad").catch (error) ->
      failed = true
    .then ->
      failed.should.eql(true)
