const fs = require('node:fs')
const chalk = require('chalk')
const path = require('node:path')
const logPath = path.resolve(__dirname, '../', 'logs')

function writeLogFile (text) {
  fs.appendFile(logPath, text, (fd) => {})
}

function info (text) {
  writeLogFile(text)
  console.log(text)
}

function debug (text) {
  writeLogFile(text)
  console.log(text)
}

function warn (text) {
  writeLogFile(text)
  console.log(text)
}

function error (text) {
  writeLogFile(text)
  console.log(text)
}

module.exports = {
  Logger: {
    debug,
    info,
    warn,
    error
  }
}
