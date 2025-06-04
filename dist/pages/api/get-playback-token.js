import Mux from '@mux/mux-node';
// Instantiate once (uses env: MUX_TOKEN_ID, MUX_TOKEN_SECRET, MUX_SIGNING_KEY, MUX_PRIVATE_KEY)
const muxClient = new Mux({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET,
    jwtSigningKey: process.env.MUX_SIGNING_KEY,
    jwtPrivateKey: process.env.MUX_PRIVATE_KEY,
});
export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    const playbackId = Array.isArray(req.query.playbackId)
        ? req.query.playbackId[0]
        : req.query.playbackId;
    if (!playbackId) {
        res.status(400).json({ error: 'Missing playbackId' });
        return;
    }
    try {
        // ← note: we await the JWT helper so token is always a string
        const token = await muxClient.jwt.signPlaybackId(playbackId, {
            // you can omit this for default 7d, or use a duration string like '2m'
            expiration: '2m',
        });
        res.status(200).json({ token });
    }
    catch (err) {
        console.error('Mux token signing failed:', err);
        res.status(500).json({ error: 'Mux token signing failed' });
    }
}
