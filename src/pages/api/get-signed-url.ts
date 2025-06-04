// pages/api/get-signed-url.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSignedPlaybackUrl } from '../../utils/mux'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // disable caching so every client request gets a fresh URL
  res.setHeader('Cache-Control', 'no-store, max-age=0')

  const playbackId = Array.isArray(req.query.playbackId)
    ? req.query.playbackId[0]
    : req.query.playbackId

  if (!playbackId) {
    return res.status(400).json({ error: 'Missing playbackId' })
  }

  try {
    // NOTE: getSignedPlaybackUrl is synchronous (it uses mux.jwt.signPlaybackId under the hood),
    // but we still await in case you later switch to an async helper.
    const url = await Promise.resolve(getSignedPlaybackUrl(playbackId))
    return res.status(200).json({ url })
  } catch (err) {
    console.error('Mux token signing failed:', err)
    return res.status(500).json({ error: 'Mux token signing failed' })
  }
}
