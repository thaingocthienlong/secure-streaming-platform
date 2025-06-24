// pages/api/drm/clearkey.ts
export const config = { api: { bodyParser: false } }
import type { NextApiRequest, NextApiResponse } from 'next'
import AWS from 'aws-sdk'
import fs from 'fs'
import path from 'path'

const kms = new AWS.KMS({ region: process.env.AWS_REGION })
const KEYSTORE_PATH = path.resolve(process.cwd(), process.env.KEYSTORE_JSON!)

interface KeystoreEntry { ciphertext: string; createdAt: string }
type Keystore = Record<string, KeystoreEntry>

async function unwrapDataKey(ct: string): Promise<Buffer> {
  const buff = Buffer.from(ct, 'base64')
  const resp = await kms.decrypt({ CiphertextBlob: buff }).promise()
  if (!resp.Plaintext) throw new Error('KMS returned no plaintext')
  return resp.Plaintext as Buffer
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed; use POST' })
  }

  try {
    // 1) Read the raw body into a Buffer
    const rawBody: Buffer = req.body instanceof Buffer
      ? req.body
      : await new Promise<Buffer>((resolve, reject) => {
          const chunks: Buffer[] = []
          req.on('data', c => chunks.push(typeof c === 'string' ? Buffer.from(c) : c))
          req.on('end', () => resolve(Buffer.concat(chunks)))
          req.on('error', reject)
        })

    console.log('↪ [clearkey] rawBody length =', rawBody.length)

    // 2) Try parsing as JSON { kids: [ base64 ], type: ... }
    let kidBuffers: Buffer[] = []
    try {
      const json = JSON.parse(rawBody.toString('utf8'))
      console.log('↪ [clearkey] JSON request body =', json)
      if (!Array.isArray(json.kids) || json.kids.length === 0) {
        throw new Error('Missing kids array')
      }
      kidBuffers = json.kids.map((b64: string) => Buffer.from(b64, 'base64'))
    } catch (_e) {
      // 3) Fallback to CENC PSSH parsing
      console.log('↪ [clearkey] Falling back to PSSH parsing')
      if (rawBody.length < 48) {
        return res.status(400).json({ error: 'initData too short; cannot parse KID' })
      }
      const count = rawBody.readUInt32BE(28)  // number of KIDs
      console.log('↪ [clearkey] PSSH kidCount =', count)
      for (let i = 0; i < count; i++) {
        const offset = 32 + i * 16
        if (rawBody.length >= offset + 16) {
          kidBuffers.push(rawBody.subarray(offset, offset + 16))
        }
      }
      if (kidBuffers.length === 0) {
        return res.status(400).json({ error: 'No KIDs extracted' })
      }
    }

    // 4) Load your keystore.json
    if (!fs.existsSync(KEYSTORE_PATH)) {
      return res.status(500).json({ error: `Keystore not found at ${KEYSTORE_PATH}` })
    }
    let raw = fs.readFileSync(KEYSTORE_PATH, 'utf8')
    // strip BOM or garbage before '{'
    const b = raw.indexOf('{')
    if (b > 0) raw = raw.slice(b)
    const keystore: Keystore = JSON.parse(raw)
    console.log('↪ [clearkey] available KIDs =', Object.keys(keystore))

    // 5) For each requested KID, decrypt and build the ClearKey response
    const keys = []
    for (const buf of kidBuffers) {
      const hex = buf.toString('hex')
      console.log('↪ [clearkey] processing kidHex =', hex)
      const entry = keystore[hex]
      if (!entry) {
        return res.status(403).json({ error: `KID ${hex} not found in keystore` })
      }
      const plaintext = await unwrapDataKey(entry.ciphertext)
      keys.push({
        kty: 'oct' as const,
        kid: buf.toString('base64').replace(/=+$/, ''),
        k:   plaintext.toString('base64').replace(/=+$/, ''),
      })
    }

    const response = { keys }
    console.log('↪ [clearkey] response JSON =', response)
    res.setHeader('Content-Type', 'application/json')
    return res.status(200).json(response)

  } catch (err: any) {
    console.error('Error in /api/drm/clearkey:', err)
    return res.status(500).json({ error: err.message || 'Unknown error' })
  }
}
