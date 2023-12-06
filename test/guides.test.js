import { describe, it } from 'mocha'
import assert from 'assert'
import {
  GetGuideCount,
  GetGuides
} from '../src/utils/GuideHelper.js'

describe('Guides', () => {
  describe('@load', () => {
    it('should be equal to the file count in the real directory', () => {
      assert.equal(GetGuides().length, GetGuideCount())
    })
    it('should not have any undefined or empty titles', () => {
      assert.equal(GetGuides().find(guide => typeof (guide.name) !== 'string' || guide.name === ''), null)
    })
    it('should not have any undefined or empty descriptions', () => {
      assert.equal(GetGuides().find(guide => typeof (guide.description) !== 'string' || guide.description === ''), null)
    })
    it('should not have any undefined or empty responses', () => {
      assert.equal(GetGuides().find(guide => typeof (guide.response) !== 'string' || guide.response === ''), null)
    })
  })
})
