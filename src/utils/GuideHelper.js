import fs from 'node:fs'
import path from 'node:path'
import { Logger } from '../Logger.js'

const guidePath = path.resolve('guides')
let guides = []

export function GetGuideCount () {
  return fs.readdirSync(path.resolve(guidePath)).length
}

function LoadGuides () {
  Logger.info('Loading Guide Commands...')
  guides = fs.readdirSync(guidePath).map(guide => JSON.parse(String(fs.readFileSync(path.resolve(guidePath, guide)))))
}

export function GetGuides () {
  return guides
}

LoadGuides()
