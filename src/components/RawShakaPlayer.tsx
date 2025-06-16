// src/components/RawShakaPlayer.tsx

import React, { useEffect, useRef } from 'react'
import shaka from 'shaka-player/dist/shaka-player.ui.js'
import 'shaka-player/dist/controls.css'  // <-- Let Next.js bundle this CSS

interface RawShakaPlayerProps {
  manifestUri: string
}

const RawShakaPlayer: React.FC<RawShakaPlayerProps> = ({ manifestUri }) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!videoRef.current) return

    if (!shaka.Player.isBrowserSupported()) {
      console.error('Shaka Player is not supported in this browser.')
      return
    }

    const player = new shaka.Player(videoRef.current)

    // Configure ClearKey (empty clearKeys means "fetch JSON from our endpoint")
    player.configure({
      drm: {
        // Map the ClearKey key system to your Next.js API route:
        servers: {
          'org.w3.clearkey': window.location.origin + '/api/drm/clearkey',
        },
        // (You do NOT need clearKeys:{} here if you are fetching from a server.)
      },
    })

    // Intercept license requests and point them at /api/drm/clearkey
    player.getNetworkingEngine().registerRequestFilter((type, request) => {
      if (type === shaka.net.NetworkingEngine.RequestType.LICENSE) {
        request.uris = [window.location.origin + '/api/drm/clearkey']
      }
      if (type === shaka.net.NetworkingEngine.RequestType.SEGMENT) {
        request.headers['Cache-Control'] = 'no-cache'
      }
    })

    // Load the encrypted manifest
    player
      .load(manifestUri)
      .then(() => console.log('Shaka loaded manifest'))
      .catch(err => console.error('Error loading manifest:', err))

    return () => {
      player.destroy()
    }
  }, [manifestUri])

  return (
    <video
      ref={videoRef}
      width={640}
      height={360}
      controls
      style={{ backgroundColor: '#000' }}
    />
  )
}

export default RawShakaPlayer
