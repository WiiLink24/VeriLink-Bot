import fs from 'node:fs'
import chalk from 'chalk'
import path from 'node:path'

const logPath = path.resolve('logs', `${new Date().toLocaleDateString().replace(/\//g, '-')}.log`)
const config = fs.existsSync('./config/config.json') ? JSON.parse(String(fs.readFileSync('./config/config.json'))) : null

function writeLogFile (text) {
  if (config === null || !config.writeConsoleToFile) return
  fs.appendFileSync(logPath, `${text}\n`)
}

function info (text) {
  const logText = `[${new Date().toLocaleTimeString()}] [Info] ${text}`
  writeLogFile(logText)
  console.log(`${chalk.white()}${logText}`)
}

function debug (text) {
  const logText = `[${new Date().toLocaleTimeString()}] [Debug] ${text}`
  writeLogFile(logText)
  console.log(`${chalk.gray()}${logText}`)
}

function warn (text) {
  const logText = `[${new Date().toLocaleTimeString()}] [Warn] ${text}`
  writeLogFile(logText)
  console.log(`${chalk.yellow()}${logText}`)
}

function error (text) {
  const logText = `[${new Date().toLocaleTimeString()}] [Error] ${text}`
  writeLogFile(logText)
  console.log(`${chalk.red()}${logText}`)
}

export const Logger = {
  debug,
  info,
  warn,
  error
}
