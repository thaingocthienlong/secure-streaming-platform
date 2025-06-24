// src/components/VideoPlayer.tsx

import React from 'react'
import dynamic from 'next/dynamic'

// “RawShakaPlayer” will only render on the client (never on the server).
const RawShakaPlayer = dynamic(
  () => import('./RawShakaPlayer'),
  { ssr: false }
)

interface VideoPlayerProps {
  manifestUri: string
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ manifestUri }) => {
  return <RawShakaPlayer manifestUri={manifestUri} />
}

export default VideoPlayer
