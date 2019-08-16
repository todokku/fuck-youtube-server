import { readFileSync } from 'fs'
import { join } from 'path'

import { getMainPageResponse, getResponseFromEmbedEndpoint } from './requester'
import { getVideoSrc } from './index'

jest.mock('./requester')

const validMainPageResponse = readFileSync(join(__dirname, '../../mocks/tubeUnblock/mainPageResponse.html'), 'utf8')
const validEmbedResponse = readFileSync(join(__dirname, '../../mocks/tubeUnblock/embedResponse.html'), 'utf8')

describe('extract mirrors from TubeUnblock page', () => {
  describe('successful scenarios', () => {
    beforeEach(() => {
      getMainPageResponse.mockResolvedValue({ data: validMainPageResponse })
      getResponseFromEmbedEndpoint.mockResolvedValue({ data: validEmbedResponse })
    })

    it('should return video source starting with "https://tubeunblock.com/video/"', () => {
      return expect(getVideoSrc('https://www.youtube.com/watch?v=tliR8gHahjc')).resolves.toMatchObject({
        resolution: 360,
        link: expect.stringContaining('https://tubeunblock.com/video/')
      })
    })
  })

  describe('unsuccessful scenarios', () => {
    it('should return null when link passed is not a YouTube video link', () => {
      return expect(getVideoSrc('https://github.com')).resolves.toBe(null)
    })

    it('should return null when iframe src is not found on TubeUnblock page', () => {
      getMainPageResponse.mockResolvedValue({ data: '<html>Error Page</html>' })

      return expect(getVideoSrc('https://www.youtube.com/watch?v=tliR8gHahjc')).resolves.toBe(null)
    })

    it('should return null when second request (sent to /embed) returns page without video source', () => {
      getMainPageResponse.mockResolvedValue({ data: validMainPageResponse })
      getResponseFromEmbedEndpoint.mockResolvedValue({ data: '<html>Error Page</html>' })

      return expect(getVideoSrc('https://www.youtube.com/watch?v=tliR8gHahjc')).resolves.toBe(null)
    })
  })
})