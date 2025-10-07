Verification steps (tailored to Semgrep findings):

1) Confirm repository root and current commit (optional but recommended):
   git rev-parse HEAD

2) Apply the patch (from repo root):
   git apply fix-xss-postmessage-docker-semgrep.patch
   # If apply fails due to context mismatch, open files and apply the changes manually using the patch as a guide.

3) Install/build/test:
   npm ci
   npm run build
   npm run test   # or project-specific test targets

4) Validate changes:
   - Files flagged by Semgrep should no longer use raw dangerouslySetInnerHTML without sanitization.
   - postMessage calls should use explicit targetOrigin; listeners should check event.origin and validate event.data schema.
   - Components using DomSanitizer.bypassSecurityTrustResourceUrl should validate URLs against an allowlist.
   - Dockerfile should create a non-root user and not run as root.

5) If requested, provide PGP public key for encrypted PoC delivery.
