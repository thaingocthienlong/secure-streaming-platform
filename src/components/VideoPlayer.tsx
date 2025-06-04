import { useEffect, useState } from 'react'
import MuxPlayer from '@mux/mux-player-react'

export default function VideoPlayer({ playbackId }: { playbackId: string }) {
  const [playbackToken, setPlaybackToken] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/get-playback-token?playbackId=${encodeURIComponent(playbackId)}`, {
      cache: 'no-store',
    })
      .then(res => res.json())
      .then(data => {
        if (!cancelled && data.token) {
          setPlaybackToken(data.token)   // <-- this is always a string
        }
      })
      .catch(err => console.error(err))
    return () => {
      cancelled = true
    }
  }, [playbackId])

  if (!playbackToken) {
    return <p>Loading video…</p>
  }

  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden shadow">
      <MuxPlayer
        playbackId={playbackId}
        playback-token={playbackToken}
        streamType="on-demand"
        metadata={{ video_id: playbackId }}
        className="w-full h-full"
      />
    </div>
  )
}
