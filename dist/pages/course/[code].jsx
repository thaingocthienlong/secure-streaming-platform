// pages/course/[code].tsx
import { useState } from 'react';
import { getServerSession } from 'next-auth/next';
import Mux from '@mux/mux-node';
import { authOptions } from '../api/auth/[...nextauth]';
import courses from '../../../data/courses.json';
import allowed from '../../../data/allowed_emails.json';
import VideoPlayer from '../../components/VideoPlayer';
import { Box, Typography, Card, CardActionArea, CardMedia, CardContent, Stack, } from '@mui/material';
export const getServerSideProps = async (ctx) => {
    var _a, _b;
    // 1) Session + course access guard (unchanged)
    const session = await getServerSession(ctx.req, ctx.res, authOptions);
    if (!((_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.email)) {
        return { redirect: { destination: '/access', permanent: false } };
    }
    const email = session.user.email;
    const code = (_b = ctx.params) === null || _b === void 0 ? void 0 : _b.code;
    const course = courses[code];
    const allowedList = allowed[code] || [];
    if (!course || !allowedList.includes(email)) {
        return { redirect: { destination: '/access', permanent: false } };
    }
    // 2) Instantiate Mux client
    const muxClient = new Mux({
        tokenId: process.env.MUX_TOKEN_ID,
        tokenSecret: process.env.MUX_TOKEN_SECRET,
        jwtSigningKey: process.env.MUX_SIGNING_KEY,
        jwtPrivateKey: process.env.MUX_PRIVATE_KEY,
    });
    // 3) Build playlist with signed thumbnail URLs
    const playlistPromises = course.sections.flatMap((sec, sIdx) => sec.videos.map(async (vid, vIdx) => {
        // await the async signPlaybackId call
        const token = await muxClient.jwt.signPlaybackId(vid.muxPlaybackId, {
            type: 'thumbnail',
            params: { width: "240" },
            expiration: '2m',
        });
        // now this is a real string
        const thumbnailUrl = `https://image.mux.com/${vid.muxPlaybackId}/thumbnail.png?token=${token}`;
        return Object.assign(Object.assign({}, vid), { sectionIndex: sIdx, videoIndex: vIdx, thumbnailUrl });
    }));
    const playlist = await Promise.all(playlistPromises);
    return { props: { course, playlist } };
};
export default function CoursePage({ course, playlist }) {
    const [current, setCurrent] = useState({ section: 0, video: 0 });
    const selected = playlist.find((v) => v.sectionIndex === current.section && v.videoIndex === current.video);
    return (<Box sx={{ p: 2, maxWidth: '1400px', mx: 'auto' }}>
      <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
        }}>
        {/* Player (5/6 width) */}
        <Box sx={{ flex: 5 }}>
          <VideoPlayer playbackId={selected.muxPlaybackId}/>
          <Typography variant="h5" sx={{ mt: 2 }}>
            {selected.title}
          </Typography>
        </Box>

        {/* Sidebar (1/6 width) */}
        <Box sx={{ flex: 1, maxHeight: '80vh', overflowY: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Playlist
          </Typography>
          <Stack spacing={1}>
            {playlist.map((vid) => {
            const isActive = vid.sectionIndex === current.section &&
                vid.videoIndex === current.video;
            return (<Card key={`${vid.sectionIndex}-${vid.videoIndex}`} elevation={isActive ? 6 : 1}>
                  <CardActionArea onClick={() => setCurrent({
                    section: vid.sectionIndex,
                    video: vid.videoIndex,
                })}>
                    <CardMedia component="img" height="80" image={vid.thumbnailUrl} alt={vid.title}/>
                    <CardContent>
                      <Typography variant="body2" noWrap sx={{ fontWeight: isActive ? 'bold' : 'normal' }}>
                        {vid.title}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>);
        })}
          </Stack>
        </Box>
      </Box>
    </Box>);
}
