// pages/api/drm/clearkey.ts

export const config = { api: { bodyParser: false } }

import type { NextApiRequest, NextApiResponse } from 'next'
import AWS from 'aws-sdk'
import fs from 'fs'
import path from 'path'

// AWS KMS client
const kms = new AWS.KMS({ region: process.env.AWS_REGION })

// Path to keystore.json (from your .env.local)
const KEYSTORE_PATH = path.resolve(process.cwd(), process.env.KEYSTORE_JSON!)

// Keystore entry type
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
    // 1) Read raw body
    const rawBody: Buffer = req.body instanceof Buffer
      ? req.body
      : await new Promise<Buffer>((resolve, reject) => {
          const chunks: Buffer[] = []
          req.on('data', c => chunks.push(c as Buffer))
          req.on('end', () => resolve(Buffer.concat(chunks)))
          req.on('error', e => reject(e))
        })

    console.log('↪ [clearkey] raw length =', rawBody.length)

    // 2) Load the keystore
    let raw = fs.readFileSync(KEYSTORE_PATH, 'utf8')
    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1)
    const keystore: Keystore = JSON.parse(raw)
    console.log('↪ [clearkey] available KIDs =', Object.keys(keystore))

    // TODO: JSON vs. PSSH parsing here → extract kid buffers
    // TODO: unwrap each via unwrapDataKey(), build { keys: [ { kty, kid, k } ] }

    return res.status(200).json({ keys: [] })
  } catch (e: any) {
    console.error(e)
    return res.status(500).json({ error: e.message })
  }
}
