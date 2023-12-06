const fs = require('node:fs')
const path = require('node:path')
const guidePath = path.resolve(__dirname, '../', '../', 'guides')

let guides = []

function GetGuideCount () {
  return fs.readdirSync(path.resolve(guidePath)).length
}

function ReloadGuides () {
  console.log('Loading guides')
  guides = fs.readdirSync(guidePath).map(guide => JSON.parse(String(fs.readFileSync(path.resolve(guidePath, guide)))))
}

function GetGuides () {
  return guides
}

ReloadGuides()

module.exports = {
  GetGuides,
  GetGuideCount
}
