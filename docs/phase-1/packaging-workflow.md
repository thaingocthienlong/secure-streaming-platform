# Packaging & Encryption Workflow (Phase 1)

**Objective:** Transcode and encrypt video files (DASH + CENC and HLS + SAMPLE-AES) so they can only play when a license is issued.

## 1. Inputs

- One or more MP4 source files (e.g., `sample.mp4`, `sample_640.mp4`).  
- A 16-byte content key (hex) and a 16-byte key ID (hex) for each video.

## 2. Tools

- [Shaka Packager](https://github.com/google/shaka-packager) (version 2.x).  
- `openssl` (to generate random hex strings).  
- (Later) AWS KMS or Google KMS to store keys.

## 3. Output Structure

We will output into a folder structure like:
/encrypted
├ audio.m4s # encrypted audio
├ video_1080.m4s # encrypted 1080p video track
├ video_640.m4s # encrypted 640p video track (optional)
└ manifest.mpd # encrypted DASH manifest

## 4. Step-by-Step (Single-Bitrate Example)

1. **Generate KID & Key:** 

   ```bash
   openssl rand -hex 16  # → 3a1f2e4c5b6a7d8e9f0a1b2c3d4e5f6a (my test KID)
   openssl rand -hex 16  # → a1b2c3d4e5f6071829ab0c1d2e3f4a5b (my test KEY)
2. **Run Packager:**

packager \
  input=sample.mp4,stream=video,output=encrypted/video_1080.m4s \
  input=sample.mp4,stream=audio,output=encrypted/audio_1080.m4s \
  --enable_raw_key_encryption \
  --keys label=video:key_id=3a1f2e4c5b6a7d8e9f0a1b2c3d4e5f6a:key=a1b2c3d4e5f6071829ab0c1d2e3f4a5b \
  --mpd_output encrypted/manifest.mpd
3. **Check the DASH MPD:**
less encrypted/manifest.mpd
Confirm you see <ContentProtection cenc:default_KID="3a1f2e4c5b6a7d8e9f0a1b2c3d4e5f6a" ...>

4. **Serve Locally (Test):**

cd ~/drm-test
python3 -m http.server 8080
Visit http://localhost:8080/encrypted/manifest.mpd in Chrome. You’ll see an error about “No license server defined,” which is expected.

