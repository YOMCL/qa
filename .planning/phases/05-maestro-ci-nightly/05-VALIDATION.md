---
phase: 5
slug: maestro-ci-nightly
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-17
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | GitHub Actions + Maestro CLI 1.40.0 |
| **Config file** | `.github/workflows/app-maestro.yml` (Wave 0 creates this) |
| **Quick run command** | `yamllint .github/workflows/app-maestro.yml` (syntax only) |
| **Full suite command** | Manual `workflow_dispatch` trigger via GitHub UI or `gh workflow run app-maestro.yml` |
| **Estimated runtime** | ~25–40 min (emulator boot 5 min + flows 20–35 min) |

---

## Sampling Rate

- **After every task commit:** `yamllint .github/workflows/app-maestro.yml` (YAML syntax valid)
- **After wave 1:** Manual `workflow_dispatch` — verify workflow starts and emulator boots
- **Before `/gsd:verify-work`:** Full nightly run with APK producing artifact + failure notification
- **Max feedback latency:** 40 min (emulator-dependent)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-T1 | 01 | 1 | REQ-07 | structural | `test -f .github/workflows/app-maestro.yml && yamllint .github/workflows/app-maestro.yml` | ❌ W0 | ⬜ pending |
| 05-01-T2 | 01 | 1 | REQ-07 | structural | `grep -q "schedule:" .github/workflows/app-maestro.yml` | ❌ W0 | ⬜ pending |
| 05-01-T3 | 01 | 1 | REQ-07 | structural | `grep -q "upload-artifact" .github/workflows/app-maestro.yml` | ❌ W0 | ⬜ pending |
| 05-01-T4 | 01 | 1 | REQ-07 | structural | `grep -qE "slack|gh issue" .github/workflows/app-maestro.yml` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `.github/workflows/app-maestro.yml` — the workflow file (REQ-07) — created in Wave 1 Task 1
- [ ] GitHub Actions secrets configured in repo settings: `APK_URL`, `APP_PACKAGE`, `TEST_SELLER_EMAIL`, `TEST_SELLER_PASSWORD`, `SLACK_MAESTRO_WEBHOOK` (or equivalent)
- [ ] APK distribution decision resolved — URL must be accessible from GitHub Actions runner

*Note: All Wave 0 items are created by the plan itself — they don't require pre-existing infrastructure.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Nightly cron fires at expected time | REQ-07 | GitHub cron not testable locally | Check Actions tab the morning after first deploy |
| Emulator boots and Maestro connects | REQ-07 | Requires real GH Actions runner + KVM | Trigger `workflow_dispatch`, watch emulator boot step |
| Failure notification delivered | REQ-07 | Requires real Slack webhook or GH token | Force failure with bad credentials, verify notification |
| APK installs on emulator | REQ-07 | Requires real APK URL secret + emulator | Full run with APK_URL secret set |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: 4 tasks, all have automated YAML structural checks
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 40 min
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
