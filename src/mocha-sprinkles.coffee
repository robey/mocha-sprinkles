child_process = require 'child_process'
fs = require 'fs'
Q = require 'q'
shell = require 'shelljs'
util = require 'util'

# run a test as a future, and call mocha's 'done' method at the end of the chain.
exports.future = (f) ->
  (done) ->
    f().then((-> done()), ((error) -> done(error)))

exports.withTempFolder = (f) ->
  (x...) ->
    uniq = null
    tries = 0
    loop
      tries += 1
      uniq = "/tmp/mocha-#{Date.now()}-#{Math.floor(Math.random() * 1000000)}"
      try
        fs.mkdirSync(uniq, 0o700)
        break
      catch e
        if tries >= 5 then throw new Error("Unable to create temporary folder: #{e}")
        # try again with a different folder name
    # save old cwd, to restore afterwards, and cd into the temp folder.
    oldCwd = process.cwd()
    process.chdir uniq
    # sometimes (especially on macs), the real folder name will be different.
    realname = process.cwd()
    f(realname, x...).fin ->
      process.chdir oldCwd
      shell.rm "-r", uniq

# run a command & wait for it to end.
exports.exec = (command, options={}) ->
  deferred = Q.defer()
  p = child_process.exec command, options, (error, stdout, stderr) ->
    if error?
      error.process = p
      error.stdout = stdout
      error.stderr = stderr
      deferred.reject(error)
    else
      deferred.resolve(process: p, stdout: stdout, stderr: stderr)
  deferred.promise
