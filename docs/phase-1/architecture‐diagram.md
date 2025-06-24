High-Level Architecture Diagram
Now that you have all the pieces in writing, it’s time for a simple diagram to tie them together.

Open your favorite diagram tool (draw.io, Lucidchart, or even PowerPoint).

Draw these components as boxes (left to right):

[User’s Browser / EME] → [Next.js Frontend (DL Manifest)] → [CDN / Storage (Encrypted Segments)] 
                         ↓
                 [Next.js License API (/api/drm/license)]
                         ↓
                    [License Server Logic]
                         ↓
                       [KMS (AWS KMS)]
Label each arrow with what data flows along it:

Browser → Frontend: “Requests manifest.mpd (encrypted).”

Browser → License API: “Sends INIT DATA + Entitlement JWT.”

License API → KMS: “If JWT is valid, KMS decrypts content key for KID.”

License Server → Browser: “Returns binary license; Browser CDM decrypts segments on the fly.”

Save it as docs/phase-1/architecture-diagram.png (or PDF).

Commit it:
git add docs/phase-1/architecture-diagram.png
git commit -m "Add high-level DRM architecture diagram"
