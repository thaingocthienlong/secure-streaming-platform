import fetch from 'node-fetch';
import Mux from '@mux/mux-node';
const muxClient = new Mux({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET,
    jwtSigningKey: process.env.MUX_SIGNING_KEY,
    jwtPrivateKey: process.env.MUX_PRIVATE_KEY,
});
export default async function handler(req, res) {
    // never cache these endpoints
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    // e.g. req.query.stream = ['REACT101','manifest'] or ['REACT101','segment']
    const parts = req.query.stream;
    if (!parts || parts.length < 2) {
        res.status(400).json({ error: 'Invalid stream path' });
        return;
    }
    const [playbackId, type] = parts;
    try {
        if (type === 'manifest') {
            // 1) Sign a fresh token
            const token = await muxClient.jwt.signPlaybackId(playbackId, {
                // you can omit this to get default 7d, or use '2m','1h', etc.
                expiration: '2m'
            });
            // 2) Build the actual Mux URL
            const manifestUrl = `https://stream.mux.com/${playbackId}.m3u8?token=${token}`;
            console.log('Proxying manifest URL:', manifestUrl);
            // 3) Fetch it server-side
            const upstream = await fetch(manifestUrl);
            if (!upstream.ok) {
                res.status(upstream.status).end();
                return;
            }
            // 4) Rewrite every segment URL in the playlist to go back through us
            let body = await upstream.text();
            body = body.replace(
            // look for absolute Mux URLs ending in .ts?token=...
            /https:\/\/stream\.mux\.com\/([^\/?]+\/[^?\s]+)\?token=[^\s]+/g, (_match, segmentPath) => {
                // segmentPath is like "REACT101/abcd1234/segment1.ts"
                return `/api/stream/${playbackId}/segment?path=${encodeURIComponent(segmentPath)}`;
            });
            res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
            res.send(body);
            return;
        }
        if (type === 'segment') {
            const pathParam = req.query.path || '';
            if (!pathParam) {
                res.status(400).json({ error: 'Missing segment path' });
                return;
            }
            // 1) Sign a fresh token again
            const token = await muxClient.jwt.signPlaybackId(playbackId, {
                expiration: '2m'
            });
            const segmentUrl = `https://stream.mux.com/${pathParam}?token=${token}`;
            console.log('Proxying segment URL:', segmentUrl);
            const upstream = await fetch(segmentUrl);
            if (!upstream.ok) {
                res.status(upstream.status).end();
                return;
            }
            // 2) Proxy headers & data stream
            upstream.headers.forEach((value, key) => {
                res.setHeader(key, value);
            });
            res.status(200);
            const nodeStream = upstream.body;
            nodeStream.pipe(res);
            return;
        }
        // anything else is a 404
        res.status(404).end();
    }
    catch (err) {
        console.error('Stream proxy error:', err);
        res.status(500).end();
    }
}
