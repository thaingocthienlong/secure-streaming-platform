// // src/utils/mux.ts
import Mux from '@mux/mux-node';

const muxClient = new Mux({
  tokenId:     process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
})

// Your function should use the exported Video
export async function getSignedPlaybackUrl(playbackId: string, expiresInSec = 120): Promise<string> {
  const token = muxClient.jwt.signPlaybackId(playbackId, {
    expiration: expiresInSec.toString(),
  })
  return `https://stream.mux.com/${playbackId}.m3u8?token=${token}`
}

// MUX_SIGNING_KEY=00GD02mthH019HospXT9NSKewJzmAkOHT5KkM4lK02yUK54
// MUX_PRIVATE_KEY="LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFcEFJQkFBS0NBUUVBMHlXRUlBWmpiNi80a0FydDl2NkVYWFRMVDIwckhBNHVvT3hRQ3MvbEQxUm5KR1dOCldBZmFsdEVia3BEVG9HVmFiZGhlNWN0d29EdzBIbzBmelRlcGtnc2FkQWtnZEZUd0w3eTJEdk80V05uTjdndFYKUXlZdkxwRHoxU1lGcHVnazRSRFk0S3Yyb2UzUVUyVFFDSFJKTlc3cnVnVFd6OGRNZURFS2VpSkNkcHNiSzZqYwpJMWNMZXEwSW10RGZuSGNtNkN2YkdKSE1ScXBvT0lGSTVKNXA2dU9pZGxpNEpNWXJOQ0pDR3l6T1JBTHpSL3RFCkpiMjNNSFg2WGZ1elcyZW80MmgyVDk0YXNqdDNqWmVFeG9RaHA1ZDQyREhXVnorWTlsQWNZTEdjK2JCcmNGcEsKM2QxZHpISTVrMFVyWDlhblFiV1Y2SmdpTVpvcHMwb2xPVFFoYXdJREFRQUJBb0lCQUJZbHpabk5CeFIwWVRQbwpGdXFkUUpCMlZpRWdYVnVWclQ4Wi8rZGRHVFRReGZvNUMyakd6TW54dmR6K0xnU1paN0UxVEtHa0E2TlFkLzNBClpkYVJLOHRJT04vS1dVb2xPQVhQTUtCRU5sRUk2azNrTXhtcnRxL3NGU0l3TG5yc2NpU0lMNGVaak1ib0pXaFUKbnh4VDZQTkpqWlpoNHVVV2phYzBnRm5Xb0NGdjYzK2swczdzemtvVFVVQjdtVGllK3dyd0YzU08yZU44cFRhbwo4Z25yUyt4ZWlTQ29yU1VBZHU5b2V2eXgybitDbm80SjJzSUxrb1NsSnlLMHVNcUdHV01hWnFGSzlnSmRTRlVWClo4bW5PODZaVWxFZFpNV3JUbzZaNUFKQXV2d21zQzJmSGMyMGZqN3p0bGZMLzVabGs0M1hjK0dmZmpwSDUzd0YKL1p5alZCa0NnWUVBNlhrcWdLUXIwQTlKdURUYS9pVkF0VGhGeXlzSWV5VnQrdjUvRjFYZTVLWEY4ODBDb1kvOApIV1RSZkN1V205bE1aT1F3Ujh3ZWJXQXJRMkVNU1NQb2hjcnZBMVAxTFgyOU5wTkJSVm1MOGptbjRLUElMZG1WCkh2ejZ6N1dac3p4UVplb01SczNhWnd5VTBkeWZTT3JQTEV0N2R2VEpwbVo5U3ZwcFlGdUpFRVVDZ1lFQTU0VGcKQWpSa21UZ1BvdFNJRWpFMDE4YitzQ0tIcGprV1JGQTF5RHhQcUZad3RYdEhHYWpHNE9RSHdYWG5vaktjNkdsZApHU0MrbGcrRFJBSTNXQkpmV1pIMWg4QWhUeDhrMEkvRUQ1SHlybkxsZmtUN25rVzZnWXlzMC9Td2RzV2VCcnJHCi9pSzRSbE8vRVlKQVJHaU1OOFB0a05xdU03cmxaQ1N1dFExL3ZlOENnWUVBcWpVZFdUOVdlWTVMcmpGS1hmR0cKcFJick90eWFpRHlYVzE1aUJQOGpTZ25Zc0k2TEZvSER5U0lRM3JkZ1N5bzEyVy9LQ3UyeVdRYTlRNWZpdndlZwpvcmw1V2pIQkVuTVNtRkR1U3NLbmxlV1dqOXlYT1dYZ293REhVTm9Sdld1QktXdGhtOVRESGxFN3hXdFQ3SExTCnFuWTFBbG9mRUdLemdRL2g5cytFc3drQ2dZRUFsZW8zdDVXL2ttdDN6SU44dlBMNStjTlVoaTlGMFQva0NFWTgKSFRYWWl2TzJOZjNtczFuVHRpcFNUMWFPc0R1LzJNcnBTdTBtSER0ZFQzdHo1T2E0c1dKUE1DRWNNSVRGTFB2NwpBKzRJekNlQUxYeHp4aS8ycmc2dWx1MDZHeDZwemtmQnRTdzhVT1hIc29tNkhkSHBBZTh2OVAxMWtlK3l2Rjc0CmRpcVFqaWNDZ1lCU3k0aG9NN3ozYVprVXNtakNzQ2RCVU5QU04vREJRYmx0L1VVeGQ5UnZLd2kvN3pmNWVYeHgKdDNDWUo4M3lmdGFaUE9iKzRSb0xFS0o1RGNFcXNZeFZ4N2llVSsyZWZycU5UcDFsYXZBZGgxRGRYNVBTM2RTbQo3OFRta2IwS3R4M1UycTdMN1NZODVjZzRuMUhkOFhSb2FuMDErZDdnekl3NVpwSGZxUWVNWnc9PQotLS0tLUVORCBSU0EgUFJJVkFURSBLRVktLS0tLQo="
// src/utils/mux.ts
// import Mux from '@mux/mux-node'
// const muxClient = new Mux({
//   tokenId:     process.env.MUX_TOKEN_ID!,
//   tokenSecret: process.env.MUX_TOKEN_SECRET!,
// })

// export function getSignedPlaybackUrl(playbackId: string, expiresInSec = 120): string {
//   // If no signing key, assume a public ID and return the unsigned URL:
//   if (!process.env.MUX_SIGNING_KEY) {
//     return `https://stream.mux.com/${playbackId}.m3u8`
//   }
//   // Otherwise generate a token as before…
//   const token = muxClient.jwt.signPlaybackId(playbackId, { expiration: expiresInSec })
//   return `https://stream.mux.com/${playbackId}.m3u8?token=${token}`
// }
