#!/usr/bin/env python3
"""
Analyze Playwright test failures and group them by root cause.

Usage:
    python3 tools/analyze-failures.py
    python3 tools/analyze-failures.py --file tests/e2e/playwright-report/results.json
"""

import json
import sys
import re
from pathlib import Path
from collections import defaultdict


def flatten_tests(suite: dict, file_hint: str = "") -> list:
    tests = []
    file_name = suite.get("file", file_hint)
    for spec in suite.get("specs", []):
        for test in spec.get("tests", []):
            results = test.get("results", [])
            last_result = results[-1] if results else {}
            error_msg = last_result.get("error", {}).get("message", "") if last_result else ""
            tests.append({
                "file": file_name.split("/")[-1] if file_name else "",
                "title": spec.get("title", ""),
                "status": test.get("status"),
                "error": error_msg,
            })
    for sub in suite.get("suites", []):
        tests.extend(flatten_tests(sub, file_name))
    return tests


def classify_error(error: str) -> tuple[str, str]:
    """
    Returns (category, short_reason) for a given error message.
    Categories: selector | timeout | credentials | real-bug | unknown
    """
    if not error:
        return ("real-bug", "Sin mensaje de error — el test llegó al final y falló la aserción")

    e = error.lower()

    # Selector not found
    if "element(s) not found" in e or "not found" in e:
        # Extract the locator
        match = re.search(r"locator\('([^']+)'\)", error)
        locator = match.group(1) if match else "locator desconocido"
        return ("selector", f"Elemento no existe en el DOM: `{locator}`")

    # Element not visible (exists but hidden)
    if "tobevisible" in e and "timeout" in e:
        match = re.search(r"locator\('([^']+)'\)", error)
        locator = match.group(1) if match else "locator desconocido"
        return ("selector", f"Elemento existe pero no es visible (timeout): `{locator}`")

    # waitForResponse timeout
    if "waitforresponse" in e and "timeout" in e:
        return ("selector", "Esperaba una request HTTP que nunca llegó (add-to-cart no se hizo click)")

    # Navigation timeout
    if "navigation" in e and "timeout" in e:
        return ("timeout", "La página tardó demasiado en cargar")

    # Assertion failure (Expected X / Received Y)
    if "expected:" in e and "received:" in e:
        match_exp = re.search(r"expected:\s*(.+)", error, re.IGNORECASE)
        match_rec = re.search(r"received:\s*(.+)", error, re.IGNORECASE)
        exp = match_exp.group(1).strip()[:60] if match_exp else "?"
        rec = match_rec.group(1).strip()[:60] if match_rec else "?"
        return ("real-bug", f"Expected: {exp} → Received: {rec}")

    # URL assertion
    if "tohaveurl" in e:
        return ("real-bug", "La app no redirigió a la URL esperada")

    # Locator fill/click timeout (element exists but interaction timed out)
    if "locator.fill" in e or "locator.click" in e:
        match = re.search(r"waiting for (.+?)[\n\r]", error)
        detail = match.group(1).strip()[:80] if match else "locator desconocido"
        return ("selector", f"No se pudo interactuar con: `{detail}`")

    # Credentials / auth
    if "401" in error or "unauthorized" in e or "login" in e:
        return ("credentials", "Error de autenticación")

    return ("unknown", error[:120])


def main():
    # Find results file
    results_file = Path("tests/e2e/playwright-report/results.json")
    if len(sys.argv) > 2 and sys.argv[1] == "--file":
        results_file = Path(sys.argv[2])

    if not results_file.exists():
        print(f"No se encontró {results_file}. Corre los tests primero.", file=sys.stderr)
        sys.exit(1)

    with open(results_file) as f:
        data = json.load(f)

    # Flatten all tests
    all_tests = []
    for suite in data.get("suites", []):
        all_tests.extend(flatten_tests(suite))

    # Separate by status
    failed = [t for t in all_tests if t["status"] == "unexpected"]
    flaky  = [t for t in all_tests if t["status"] == "flaky"]
    passed = [t for t in all_tests if t["status"] in ("expected",)]
    skipped = [t for t in all_tests if t["status"] == "skipped"]

    total = len(all_tests)
    print(f"\n{'='*60}")
    print(f"  ANÁLISIS DE RESULTADOS PLAYWRIGHT")
    print(f"{'='*60}")
    print(f"  Total: {total}  |  ✅ {len(passed)}  |  ❌ {len(failed)}  |  ⚠️  flaky {len(flaky)}  |  ⏭️  {len(skipped)}")
    print(f"{'='*60}\n")

    if not failed:
        print("✅ No hay tests fallidos.\n")
        return

    # Group failures by root cause
    groups = defaultdict(list)  # cause_key -> list of test titles
    cause_labels = {}

    for t in failed:
        category, reason = classify_error(t["error"])
        key = f"{category}::{reason}"
        groups[key].append(f"  • [{t['file']}] {t['title']}")
        cause_labels[key] = (category, reason)

    # Sort: real-bug first, then selector, then others
    order = {"real-bug": 0, "selector": 1, "timeout": 2, "credentials": 3, "unknown": 4}
    sorted_keys = sorted(groups.keys(), key=lambda k: order.get(cause_labels[k][0], 9))

    category_icons = {
        "real-bug":    "🔴 BUG REAL",
        "selector":    "🔧 SELECTOR / INFRAESTRUCTURA",
        "timeout":     "⏱️  TIMEOUT",
        "credentials": "🔑 CREDENCIALES",
        "unknown":     "❓ DESCONOCIDO",
    }

    for key in sorted_keys:
        category, reason = cause_labels[key]
        tests_in_group = groups[key]
        icon = category_icons.get(category, "❓")
        print(f"{icon}  ({len(tests_in_group)} test{'s' if len(tests_in_group) > 1 else ''})")
        print(f"  Causa: {reason}")
        for t in tests_in_group:
            print(t)
        print()

    # Flaky summary
    if flaky:
        print(f"{'─'*60}")
        print(f"⚠️  FLAKY ({len(flaky)} tests — pasaron en retry, no son bugs confirmados)")
        for t in flaky:
            print(f"  • [{t['file']}] {t['title']}")
        print()

    # Actionable summary
    real_bugs = sum(1 for k in sorted_keys if cause_labels[k][0] == "real-bug")
    infra = sum(1 for k in sorted_keys if cause_labels[k][0] in ("selector", "timeout", "credentials"))

    print(f"{'='*60}")
    print(f"  ACCIONABLES")
    print(f"{'='*60}")
    if infra:
        infra_tests = sum(len(groups[k]) for k in sorted_keys if cause_labels[k][0] in ("selector","timeout","credentials"))
        print(f"  🔧 {infra_tests} tests bloqueados por infra → arreglar selector/ambiente, no la app")
    if real_bugs:
        bug_tests = sum(len(groups[k]) for k in sorted_keys if cause_labels[k][0] == "real-bug")
        print(f"  🔴 {bug_tests} tests con bugs reales → reportar al equipo de desarrollo")
    print()


if __name__ == "__main__":
    main()
