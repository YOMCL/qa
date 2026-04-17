---
phase: 04-live-reporter-race-condition
plan: 01
subsystem: live-reporter
tags: [atomic-write, race-condition, live-dashboard, posix-rename]
dependency_graph:
  requires: []
  provides: [atomic-live-json-write]
  affects: [tools/live-reporter.js, public/live.json, tools/run-live.sh]
tech_stack:
  added: []
  patterns: [write-to-tmp-then-rename, posix-rename-atomicity]
key_files:
  modified:
    - tools/live-reporter.js
    - .gitignore
    - tools/run-live.sh
decisions:
  - "Used POSIX rename(2) pattern: write to .tmp then rename to final path — single syscall guarantees atomicity"
  - "TMP_OUTPUT placed in same directory as OUTPUT to guarantee same-filesystem (avoids EXDEV cross-device error)"
  - "No npm dependencies added — fs.renameSync is Node.js built-in"
metrics:
  duration: ~8 minutes
  completed: 2026-04-17T20:19:51Z
  tasks_completed: 3
  files_modified: 3
---

# Phase 04 Plan 01: Live Reporter Atomic Write Summary

**One-liner:** Atomic JSON write via write-then-rename (POSIX rename(2)) in live-reporter.js `_save()` — dashboard readers never see partial content.

## What Was Built

The `_save()` method in `tools/live-reporter.js` previously called `fs.writeFileSync(OUTPUT, ...)` directly, which creates a window where concurrent readers (the dashboard polling every 3s) could see a partially-written file and fail to parse JSON.

The fix applies the standard POSIX atomicity pattern:
1. Write complete JSON to `public/live.json.tmp` (same filesystem directory)
2. Call `fs.renameSync(TMP_OUTPUT, OUTPUT)` — a single kernel syscall that atomically swaps directory entries

Readers always see either the old complete file or the new complete file, never a partial write.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Atomic write in _save() via TMP_OUTPUT + renameSync | 398b287 | tools/live-reporter.js |
| 2 | Add live.json.tmp to .gitignore and EXIT trap | 17d9555 | .gitignore, tools/run-live.sh |
| 3 | Smoke test verification (no file changes) | — | — |

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

- `grep -c "renameSync" tools/live-reporter.js` → 1
- `grep -c "TMP_OUTPUT" tools/live-reporter.js` → 3 (declaration + writeFileSync + renameSync)
- `grep "writeFileSync(OUTPUT" tools/live-reporter.js` → no matches (direct write removed)
- Module loads without error: `module OK: true`
- `grep "live.json.tmp" .gitignore` → `public/live.json.tmp`
- `bash -n tools/run-live.sh` → exit 0 (valid syntax)
- Smoke test: valid JSON written, `total: 5`, `running: true`, no tmp leftover

## Self-Check: PASSED
