// scripts/packager/src/package-and-encrypt.ts

import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import AWS from 'aws-sdk'
import dotenv from 'dotenv'

// 1. Load environment variables from scripts/packager/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const SOURCE_VIDEOS_DIR = process.env.SOURCE_VIDEOS_DIR!
const OUTPUT_BASE = process.env.OUTPUT_BASE!
const KEYSTORE_JSON = process.env.KEYSTORE_JSON!
const PROCESSED_LOG = process.env.PROCESSED_LOG!

// AWS KMS client
const kms = new AWS.KMS({ region: process.env.AWS_REGION })

// Keystore helpers
interface KeystoreEntry { ciphertext: string; createdAt: string }
type Keystore = Record<string, KeystoreEntry>
function loadKeystore(p: string): Keystore {
  if (!fs.existsSync(p)) return {}
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}
function saveKeystore(p: string, ks: Keystore) {
  fs.writeFileSync(p, JSON.stringify(ks, null, 2), 'utf8')
}

// Processed-log helpers
function loadProcessed(p: string): Set<string> {
  if (!fs.existsSync(p)) return new Set()
  return new Set(JSON.parse(fs.readFileSync(p, 'utf8')) as string[])
}
function saveProcessed(p: string, s: Set<string>) {
  fs.writeFileSync(p, JSON.stringify(Array.from(s), null, 2), 'utf8')
}

// Generate a new data key
async function generateDataKey(): Promise<{ Plaintext: Buffer; CiphertextBlob: Buffer }> {
  const resp = await kms.generateDataKey({ KeyId: process.env.KMS_KEY_ALIAS!, KeySpec: 'AES_128' }).promise()
  return { Plaintext: resp.Plaintext as Buffer, CiphertextBlob: resp.CiphertextBlob as Buffer }
}

// Helper to run Shaka Packager
function runPackager(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn('packager', args, { stdio: 'inherit' })
    proc.on('exit', code => code === 0 ? resolve() : reject(new Error(`Packager exited ${code}`)))
  })
}

async function packageVideo(courseCode: string, videoId: string, inputPath: string) {
  const baseOut = path.resolve(__dirname, '..', OUTPUT_BASE)
  const dashOut = path.join(baseOut, courseCode, videoId, 'dash')
  const hlsOut = path.join(baseOut, courseCode, videoId, 'hls')
  fs.mkdirSync(dashOut, { recursive: true })
  fs.mkdirSync(hlsOut, { recursive: true })

  // 1) Generate encryption key
  const keystorePath = path.resolve(__dirname, '..', KEYSTORE_JSON)
  const ks = loadKeystore(keystorePath)
  console.log(`🔐 Generating DEK for ${courseCode}/${videoId}`)
  const { Plaintext, CiphertextBlob } = await generateDataKey()
  const keyHex = Plaintext.toString('hex')
  const kid = Plaintext.subarray(0, 16).toString('hex')

  ks[kid] = { ciphertext: CiphertextBlob.toString('base64'), createdAt: new Date().toISOString() }
  saveKeystore(keystorePath, ks)

  // 2) DASH packaging with proper drm_label
  // const dashArgs = [
  //   `in=${inputPath},stream=video,output=${path.join(dashOut, 'video_init.mp4')},segment_template=${path.join(dashOut, 'video_seg-$Number$.m4s')}`,
  //   `in=${inputPath},stream=audio,output=${path.join(dashOut, 'audio_init.mp4')},segment_template=${path.join(dashOut, 'audio_seg-$Number$.m4s')}`,
  //   '--enable_raw_key_encryption',
  //   '--keys',
  //   `label=HD:key_id=${kid}:key=${keyHex},label=AUDIO:key_id=${kid}:key=${keyHex}`,
  //   '--protection_scheme', 'cenc',
  //   '--segment_duration', '4',
  //   '--mpd_output', path.join(dashOut, 'manifest.mpd'),
  // ]

  const videoDesc =
    `in=${inputPath},stream=video,` +
    `output=${path.join(dashOut, 'video_with_sidx.mp4')}`;

  const audioDesc =
    `in=${inputPath},stream=audio,` +
    `output=${path.join(dashOut, 'audio_with_sidx.mp4')}`;

  const dashArgs = [
    videoDesc,
    audioDesc,

    // encryption:
    '--enable_raw_key_encryption',
    '--keys',
    `label=HD:key_id=${kid}:key=${keyHex},` +
    `label=UHD1:key_id=${kid}:key=${keyHex},` +
    `label=AUDIO:key_id=${kid}:key=${keyHex}`,
    '--protection_scheme', 'cenc',

    '--generate_sidx_in_media_segments',

    '--mpd_output', path.join(dashOut, 'manifest.mpd'),
  ];


  console.log(`📦 DASH packaging ${courseCode}/${videoId}`)
  await runPackager(dashArgs)

  // 3) HLS packaging with proper segmentation and drm_label
  // const hlsArgs = [
  //   // Video stream with HD label - HLS uses playlist_name instead of output for playlists
  //   `in=${inputPath},stream=video,playlist_name=video.m3u8,segment_template=${path.join(hlsOut, 'video_seg-$Number$.m4s')}`,
  //   // Audio stream with AUDIO label - HLS uses playlist_name instead of output for playlists
  //   `in=${inputPath},stream=audio,playlist_name=audio.m3u8,segment_template=${path.join(hlsOut, 'audio_seg-$Number$.m4s')}`,
  //   '--hls_master_playlist_output', path.join(hlsOut, 'master.m3u8'),
  //   '--enable_raw_key_encryption',
  //   '--keys',
  //   `label=UHD1:key_id=${kid}:key=${keyHex},label=AUDIO:key_id=${kid}:key=${keyHex}`,
  //   '--protection_scheme', 'cenc',
  //   '--hls_playlist_type', 'VOD',
  //   '--segment_duration', '2',
  // ]

  const hlsArgs = [
    // Video: produce fMP4 segments with an init file + playlist
    `in=${inputPath},stream=video,` +
    `init_segment=${path.join(hlsOut, 'video_init.mp4')},` +
    `segment_template=${path.join(hlsOut, 'video_seg-$Number$.m4s')},` +
    `playlist_name=video.m3u8`,
    // Audio: same pattern
    `in=${inputPath},stream=audio,` +
    `init_segment=${path.join(hlsOut, 'audio_init.mp4')},` +
    `segment_template=${path.join(hlsOut, 'audio_seg-$Number$.m4s')},` +
    `playlist_name=audio.m3u8`,

    '--hls_master_playlist_output', path.join(hlsOut, 'master.m3u8'),

    // DRM flags remain the same:
    '--enable_raw_key_encryption',
    '--keys',
    `label=HD:key_id=${kid}:key=${keyHex},label=UHD1:key_id=${kid}:key=${keyHex},label=AUDIO:key_id=${kid}:key=${keyHex}`,
    '--protection_scheme', 'cenc',

    '--hls_playlist_type', 'VOD',
    // Keep your 2 s chunk size (rounded to keyframe intervals)
    '--segment_duration', '2',
  ]

  console.log(`📦 HLS packaging ${courseCode}/${videoId}`)
  await runPackager(hlsArgs)

  console.log(`✅ Done ${courseCode}/${videoId}`)
}

async function main() {
  const sourceDir = path.resolve(__dirname, '..', SOURCE_VIDEOS_DIR)
  const logPath = path.resolve(__dirname, '..', PROCESSED_LOG)
  const done = loadProcessed(logPath)

  for (const courseCode of fs.readdirSync(sourceDir)) {
    const courseDir = path.join(sourceDir, courseCode)
    if (!fs.statSync(courseDir).isDirectory()) continue
    for (const file of fs.readdirSync(courseDir)) {
      if (!file.endsWith('.mp4')) continue
      const videoId = file.replace(/\.mp4$/, '')
      const key = `${courseCode}/${videoId}`
      if (done.has(key)) {
        console.log(`⏭ Skipping ${key}`)
        continue
      }
      await packageVideo(courseCode, videoId, path.join(courseDir, file))
      done.add(key)
      saveProcessed(logPath, done)
    }
  }

  console.log('🎉 All new videos processed')
  process.exit(0)
}

main().catch(err => { console.error(err); process.exit(1) })
