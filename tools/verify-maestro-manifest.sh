#!/bin/bash
# verify-maestro-manifest.sh — Smoke test for PIPE-01 manifest write
# Simulates the manifest-append block of run-maestro.sh against a temp file
# and asserts the resulting JSON has platform=app and file prefixed with app-reports/.
#
# Usage: bash tools/verify-maestro-manifest.sh

set -euo pipefail

QA_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP_DIR="$(mktemp -d)"
trap "rm -rf $TMP_DIR" EXIT

# Seed a manifest with an existing b2b entry to prove additive write
cat > "$TMP_DIR/manifest.json" <<'JSON'
{
  "reports": [
    {
      "client": "Test",
      "client_slug": "test",
      "date": "2026-01-01",
      "platform": "b2b",
      "score": 90,
      "verdict": "LISTO",
      "file": "qa-reports/test-2026-01-01.html"
    }
  ]
}
JSON

# Run the manifest-append Python block with canned values
python3 - <<PY
import json, os

manifest_file = "$TMP_DIR/manifest.json"
client_slug   = "smoketest"
client_cap    = "Smoketest"
date_str      = "2026-04-19"
environment   = "staging"
report_file   = f"{client_slug}-{date_str}.html"
passed, manual, failed, skipped, total = 3, 1, 0, 0, 4
health, verdict = 100, "LISTO"

manifest = {'reports': []}
if os.path.exists(manifest_file):
    with open(manifest_file) as f:
        manifest = json.load(f)

manifest['reports'] = [
    r for r in manifest.get('reports', [])
    if not (r.get('client_slug') == client_slug and r.get('date') == date_str)
]
manifest['reports'].append({
    'client':       client_cap,
    'client_slug':  client_slug,
    'date':         date_str,
    'file':         f'app-reports/{report_file}',
    'platform':     'app',
    'environment':  environment,
    'passed':       passed,
    'manual':       manual,
    'failed':       failed,
    'skipped':      skipped,
    'total':        total,
    'health':       health,
    'verdict':      verdict,
})
manifest['reports'].sort(key=lambda x: x['date'], reverse=True)
with open(manifest_file, 'w') as f:
    json.dump(manifest, f, indent=2, ensure_ascii=False)
PY

# Assertions
ENTRY=$(python3 -c "import json; m=json.load(open('$TMP_DIR/manifest.json')); print(json.dumps([r for r in m['reports'] if r['client_slug']=='smoketest'][0]))")

echo "$ENTRY" | python3 -c "import sys,json; e=json.loads(sys.stdin.read()); assert e['platform']=='app', f'platform mismatch: {e[\"platform\"]}'; assert e['file']=='app-reports/smoketest-2026-04-19.html', f'file mismatch: {e[\"file\"]}'; assert e['health']==100; assert e['verdict']=='LISTO'; print('✅ manifest schema OK')"

# Confirm the pre-existing b2b entry is still there (additive write)
python3 -c "import json; m=json.load(open('$TMP_DIR/manifest.json')); b2b=[r for r in m['reports'] if r.get('platform')=='b2b']; assert len(b2b)==1, f'expected 1 b2b entry, got {len(b2b)}'; print('✅ additive write — b2b entry preserved')"

# Confirm sort order (newest first)
python3 -c "import json; m=json.load(open('$TMP_DIR/manifest.json')); dates=[r['date'] for r in m['reports']]; assert dates==sorted(dates, reverse=True), f'sort broken: {dates}'; print('✅ sorted descending by date')"

echo ""
echo "✅ PIPE-01 smoke test passed"
