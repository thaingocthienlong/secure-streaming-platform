// pages/course/[courseCode]/[videoId].tsx
import { useRouter } from 'next/router'
import VideoPlayer from '@/components/VideoPlayer'

export default function CourseVideoPage() {
  const { query, isReady } = useRouter()
  if (!isReady) return <p>Loading…</p>

  const courseCode = Array.isArray(query.courseCode) ? query.courseCode[0] : query.courseCode!
  const videoId    = Array.isArray(query.videoId    ) ? query.videoId[0]    : query.videoId!

  const assetBase  = process.env.NEXT_PUBLIC_ASSET_BASE!
  const manifestUri = `${assetBase}/${courseCode}/${videoId}/dash/manifest.mpd`

  return (
    <div>
      <h1>Course: {courseCode}</h1>
      <h2>Lesson: {videoId}</h2>
      <VideoPlayer manifestUri={manifestUri} />
    </div>
  )
}
