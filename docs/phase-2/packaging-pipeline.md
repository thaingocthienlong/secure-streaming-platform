# Phase 2: Packaging & Encryption Pipeline

## Overview

In Phase 2, we automated packaging source MP4s into encrypted DASH (CENC) and HLS (SAMPLE-AES) formats, integrated with AWS KMS to generate & store data keys, and updated our `courses.json` to reference the new KIDs.

## 1. Folder Structure

your-repo/
├─ data/courses.json # course definitions, now with "kid" instead of playbackId
├─ public/encrypted/ # all encrypted assets served statically
│ └─ COURSE001/
│ ├─ lesson1/
│ │ ├─ dash/ # outputs from Shaka for DASH (video.m4s, audio.m4s, manifest.mpd)
│ │ └─ hls/ # outputs for HLS (video.ts, audio.ts, master.m3u8)
│ └─ lesson2/
│ └─ ...
├─ scripts/
│ └─ packager/
│ ├─ .env # AWS_REGION, KMS_KEY_ALIAS, OUTPUT_BASE, KEYSTORE_JSON
│ ├─ keystore.json # maps KID → ciphertext (base64) + createdAt
│ ├─ package.json
│ ├─ tsconfig.json
│ └─ src/
│ └─ package-and-encrypt.ts
└─ docs/
└─ phase-2/
├─ packaging-pipeline.md # this file
└─ (future docs)


## 2. Configuration (`scripts/packager/.env`)

```env
AWS_REGION=us-east-1
KMS_KEY_ALIAS=alias/video-drm-master-key
OUTPUT_BASE=../../public/encrypted
KEYSTORE_JSON=./keystore.json

AWS_REGION: Region of your AWS KMS CMK.

KMS_KEY_ALIAS: Alias or ARN for your CMK (permissions set in Phase 1).

OUTPUT_BASE: Relative path where encrypted assets are written (public/encrypted).

KEYSTORE_JSON: Local JSON file tracking all KID → ciphertext mappings.

## 3. The package-and-encrypt.ts Script
Loads .env.

Uses AWS SDK to call generateDataKey on your CMK:

Plaintext: raw 16‐byte DEK.

CiphertextBlob: base64 of encrypted key (KMS‐wrapped).

Derives kid by taking the first 16 bytes of Plaintext, hex‐encoding them.

Appends { kid: <KID>, ciphertext: <base64>, createdAt: <ISO> } to keystore.json.

Runs Shaka Packager via CLI:

DASH (CENC) args:

packager \
  input=<SOURCE>,stream=video,output=<…>/dash/video.m4s \
  input=<SOURCE>,stream=audio,output=<…>/dash/audio.m4s \
  --enable_raw_key_encryption \
  --keys label=video:key_id=<kid>:key=<contentKeyHex> \
  --mpd_output <…>/dash/manifest.mpd

HLS (SAMPLE-AES) args:

packager \
  input=<SOURCE>,stream=video,output=<…>/hls/video.ts \
  input=<SOURCE>,stream=audio,output=<…>/hls/audio.ts \
  --hls_master_playlist_output <…>/hls/master.m3u8 \
  --enable_raw_key_encryption \
  --keys label=video:key_id=<kid>:key=<contentKeyHex> \
  --hls_playlist_type VOD

Prints a summary including the newly generated KID.

4. How to Run
From scripts/packager, run:

npm run package:encrypt -- \
  --input "/absolute/path/to/sample.mp4" \
  --course "COURSE001" \
  --videoid "lesson1"

This produces:

public/encrypted/COURSE001/lesson1/dash/manifest.mpd (encrypted DASH).

public/encrypted/COURSE001/lesson1/hls/master.m3u8 (encrypted HLS).

Updates scripts/packager/keystore.json with new KID → ciphertext.

5. Updating courses.json
After packaging, open data/courses.json and replace each video’s playbackId (Mux) with its new "kid": "<the-KID-from-step-output>". For example:

{
  "courseCode": "COURSE001",
  "title": "Intro to Streaming",
  "videos": [
    {
      "videoId": "lesson1",
      "title": "Introduction Video",
      "kid": "3a1f2e4c5b6a7d8e9f0a1b2c3d4e5f6a"
    }
  ]
}

6. Verifying Locally
Run a static server:

npx http-server public/encrypted -p 9000
In Chrome, open:

http://localhost:9000/COURSE001/lesson1/dash/manifest.mpd
– Chrome’s console should show an EME error (no license URL defined).

In Safari, open:

http://localhost:9000/COURSE001/lesson1/hls/master.m3u8
– Safari will attempt FairPlay and fail (no CKC URL). Both are expected at this stage.

7. Next Steps
Phase 3 (Coming Soon): Create a License Server that:

Verifies the user’s entitlement JWT.

Looks up the KID in keystore.json, calls AWS KMS Decrypt on its ciphertext to retrieve raw DEK.

Calls a Widevine/PlayReady or FairPlay library to generate a license.

Returns the license to the player.

Once the license server is live, point your <ShakaPlayer> (or video.js) to:

manifestUri="https://your-domain.com/encrypted/COURSE001/lesson1/dash/manifest.mpd"

Configure .drm.licenseServerUrl = "https://your-domain.com/api/drm/license"

Phase 4 will tie it all together: the Next.js frontend, player integration, and end-to-end playback.

