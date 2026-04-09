#!/usr/bin/env python3
"""
b2b-feature-validator.py

Two-step check for each MongoDB config variable:
  1. Is it in @yomcl/types Store type? (YOMCL/monorepo)
     → If not, definitely not implemented (skip code search)
  2. Is it actually used in YOMCL/b2b source code?
     → If in type but 0 results in b2b → stub (defined but not consumed by UI)
     → Only if both pass → implemented: true

This catches cases like confirmCartText: exists in Store type but the
b2b cart component never reads it → implemented: false.

Usage:
    python3 tools/b2b-feature-validator.py --input data/qa-matrix-staging.json
    python3 tools/b2b-feature-validator.py --var confirmCartText
    python3 tools/b2b-feature-validator.py --skip-api   # use existing JSON only
    python3 tools/b2b-feature-validator.py --force      # re-check all

Output:
    data/b2b-feature-status.json
"""

import json
import re
import sys
import time
import base64
import argparse
import urllib.request
import urllib.parse
import urllib.error
from pathlib import Path
from datetime import datetime, timezone


B2B_REPO    = "YOMCL/b2b"
TYPES_REPO  = "YOMCL/monorepo"
STATUS_FILE = Path("data/b2b-feature-status.json")

SKIP_VARS = {
    "_id", "__v", "createdAt", "updatedAt", "domain", "customerId",
    "currency", "inMaintenance",
}
HOOK_PREFIX = "hooks."

# Store type files in the monorepo
STORE_TYPE_FILES = [
    "packages/types/src/store/store.ts",
    "packages/types/src/store/payment.ts",
    "packages/types/src/store/blocked-client-alert.ts",
    "packages/types/src/store/footer-custom-content.ts",
    "packages/types/src/store/contact.ts",
    "packages/types/src/store/discounts.ts",
    "packages/types/src/store/packaging-information.ts",
    "packages/types/src/store/product-detail-view-configuration.ts",
    "packages/types/src/store/shopping-detail.ts",
    "packages/types/src/store/suggestions.ts",
    "packages/types/src/store/synchronization.ts",
    "packages/types/src/store/wrong-prices.ts",
    "packages/types/src/store/background-sync.ts",
    "packages/types/src/taxes/store-taxes.ts",
]

# Prefix → type file mapping (for nested vars like payment.walletEnabled)
NESTED_PREFIXES = {
    "payment", "blockedClientAlert", "footerCustomContent", "contact",
    "discountTypes", "packagingInformation", "productDetailViewConfiguration",
    "shoppingDetail", "suggestions", "synchronization", "wrongPrices", "taxes",
    "overdueDebtConfiguration",
}


def load_env_token() -> str:
    for env_path in [Path(".env"), Path("tests/e2e/.env"), Path(".claude/.env")]:
        if env_path.exists():
            for line in env_path.read_text().splitlines():
                line = line.strip()
                if line.startswith("GITHUB_TOKEN="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    return ""


def load_status_cache() -> dict:
    if STATUS_FILE.exists():
        with open(STATUS_FILE) as f:
            return json.load(f)
    return {"b2bRepo": B2B_REPO, "variables": {}}


def save_status(status: dict) -> None:
    status["generatedAt"] = datetime.now(timezone.utc).isoformat()
    STATUS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(STATUS_FILE, "w") as f:
        json.dump(status, f, indent=2)
    print(f"✅ Saved {STATUS_FILE}")


def gh_get_file(repo: str, path: str, token: str):
    """Fetch raw file content from GitHub API."""
    url = f"https://api.github.com/repos/{repo}/contents/{urllib.parse.quote(path)}"
    req = urllib.request.Request(url)
    req.add_header("Accept", "application/vnd.github.v3+json")
    req.add_header("User-Agent", "YOM-QA-Validator/1.0")
    if token:
        req.add_header("Authorization", f"token {token}")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            d = json.loads(resp.read())
            return base64.b64decode(d["content"]).decode()
    except Exception:
        return None


def extract_type_fields(content: str) -> set[str]:
    """Extract field names from a TypeScript type/interface definition."""
    fields = set()
    for line in content.splitlines():
        m = re.match(r'^\s+(\w+)\??:', line)
        if m:
            fields.add(m.group(1))
    return fields


def build_store_type_fields(token: str) -> set[str]:
    """
    Fetch @yomcl/types Store type and all nested types.
    Returns set of all known field names (top-level and prefixed like payment.walletEnabled).
    """
    print("📦 Loading @yomcl/types Store definition from monorepo...")
    all_fields: set[str] = set()

    # Parse store.ts for top-level fields + nested type names
    store_content = gh_get_file(TYPES_REPO, STORE_TYPE_FILES[0], token) or ""
    top_level = extract_type_fields(store_content)
    all_fields.update(top_level)

    # Parse each nested type file and add prefixed fields
    for path in STORE_TYPE_FILES[1:]:
        content = gh_get_file(TYPES_REPO, path, token) or ""
        fields = extract_type_fields(content)
        # Derive prefix from filename (e.g. payment.ts → payment)
        stem = Path(path).stem  # e.g. "payment", "store-taxes"
        # Convert kebab to camelCase for matching (store-taxes → taxes)
        stem_camel = re.sub(r'-(\w)', lambda m: m.group(1).upper(), stem)
        # Find which top-level field uses this type
        for prefix in NESTED_PREFIXES:
            if prefix.lower() in stem_camel.lower() or stem_camel.lower() in prefix.lower():
                for f in fields:
                    all_fields.add(f"{prefix}.{f}")
                break

    print(f"   → {len(all_fields)} fields in Store type\n")
    return all_fields


def is_in_store_type(var_name: str, store_fields: set[str]) -> bool:
    """Check if var_name exists in Store type (exact or prefix match)."""
    if var_name in store_fields:
        return True
    # Top-level prefix match (e.g. orderPolicy.* → check if orderPolicy is in store)
    prefix = var_name.split(".")[0]
    return prefix in store_fields


def search_in_b2b(var_name: str, token: str) -> tuple:
    """Search for var_name in YOMCL/b2b via GitHub Code Search API."""
    query = urllib.parse.quote(f"{var_name} repo:{B2B_REPO}")
    url = f"https://api.github.com/search/code?q={query}&per_page=5"

    req = urllib.request.Request(url)
    req.add_header("Accept", "application/vnd.github.v3+json")
    req.add_header("User-Agent", "YOM-QA-Validator/1.0")
    if token:
        req.add_header("Authorization", f"token {token}")

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            items = data.get("items", [])
            files = [item.get("path", "") for item in items]
            return (len(items) > 0, files)
    except urllib.error.HTTPError as e:
        if e.code == 403:
            print(f"\n  ⚠️  Rate limit — waiting 60s...", end="", flush=True)
            time.sleep(60)
            return search_in_b2b(var_name, token)
        elif e.code == 422:
            return (None, [])
        else:
            print(f"  ⚠️  HTTP {e.code} for {var_name}", file=sys.stderr)
            return (None, [])
    except Exception as e:
        print(f"  ⚠️  Error: {e}", file=sys.stderr)
        return (None, [])


def extract_variables(qa_matrix: dict) -> list[str]:
    seen = set()
    for client_data in qa_matrix.get("clients", {}).values():
        for key in client_data.get("variables", {}):
            if key not in SKIP_VARS and not key.startswith(HOOK_PREFIX):
                seen.add(key)
    return sorted(seen)


def main():
    parser = argparse.ArgumentParser(description="Validate B2B feature implementation (2-step: type + code)")
    parser.add_argument("--input", default="data/qa-matrix.json")
    parser.add_argument("--var", help="Check a single variable")
    parser.add_argument("--skip-api", action="store_true", help="Use existing JSON only")
    parser.add_argument("--force", action="store_true", help="Re-check all variables")
    args = parser.parse_args()

    token = load_env_token()
    if token:
        print(f"🔑 GitHub token found")
    else:
        print(f"⚠️  No GITHUB_TOKEN in .env")

    status = load_status_cache()
    cached_vars = status.get("variables", {})

    if args.skip_api:
        print_summary(cached_vars)
        return

    matrix_path = Path(args.input)
    if not matrix_path.exists():
        print(f"Error: {args.input} not found.", file=sys.stderr)
        sys.exit(1)

    with open(matrix_path) as f:
        qa_matrix = json.load(f)

    variables = [args.var] if args.var else extract_variables(qa_matrix)
    print(f"📋 {len(variables)} variables to check\n")

    # Step 1: Load Store type fields from monorepo
    store_fields = build_store_type_fields(token)

    # Determine which need code search (skip cached unless --force)
    to_check = [v for v in variables if args.force or v not in cached_vars]
    already_cached = len(variables) - len(to_check)
    if already_cached:
        print(f"   → {already_cached} already cached, checking {len(to_check)} new\n")

    if not to_check:
        print("   All cached. Use --force to re-check.")
        print_summary(cached_vars)
        return

    # Step 2: For each variable — type check first, then code search
    delay = 2.0 if token else 2.5
    not_in_type = []
    to_code_search = []

    print("🔍 Step 1 — Filter by Store type:")
    for var in to_check:
        in_type = is_in_store_type(var, store_fields)
        if not in_type:
            not_in_type.append(var)
            cached_vars[var] = {"implemented": False, "files": [], "reason": "not in @yomcl/types Store"}
            print(f"  ✗ {var} — not in Store type")
        else:
            to_code_search.append(var)

    print(f"\n🔍 Step 2 — Code search in {B2B_REPO} ({len(to_code_search)} vars):")
    est = round(len(to_code_search) * delay / 60, 1)
    print(f"   ⏱  ~{est} min\n")

    for i, var_name in enumerate(to_code_search, 1):
        print(f"  [{i:02d}/{len(to_code_search):02d}] {var_name}... ", end="", flush=True)
        found, files = search_in_b2b(var_name, token)

        if found is None:
            print("⚠️  skipped (API error)")
        elif found:
            print(f"✓ ({len(files)} file{'s' if len(files) != 1 else ''})")
            cached_vars[var_name] = {"implemented": True, "files": files}
        else:
            print(f"✗ stub (in type, not consumed by UI)")
            cached_vars[var_name] = {"implemented": False, "files": [], "reason": "in @yomcl/types but not used in b2b code"}

        time.sleep(delay)

    status["variables"] = cached_vars
    status["b2bRepo"] = B2B_REPO
    status["typesRepo"] = TYPES_REPO
    status["note"] = "Two-step: @yomcl/types Store type + YOMCL/b2b code search"
    save_status(status)
    print()
    print_summary(cached_vars)


def print_summary(variables: dict) -> None:
    implemented     = [k for k, v in variables.items() if v.get("implemented") is True]
    not_implemented = [k for k, v in variables.items() if v.get("implemented") is False]
    unknown         = [k for k, v in variables.items() if v.get("implemented") is None]

    print(f"\n📊 Summary:")
    print(f"   ✓ Implemented (type + code):  {len(implemented)}")
    print(f"   ✗ Not implemented:            {len(not_implemented)}")
    if unknown:
        print(f"   ? Unknown (API error):       {len(unknown)}")

    if not_implemented:
        not_in_type = [k for k, v in variables.items() if v.get("implemented") is False and "not in @yomcl" in v.get("reason", "")]
        stubs       = [k for k, v in variables.items() if v.get("implemented") is False and "stub" in v.get("reason", "")]
        if not_in_type:
            print(f"\n   ✗ Not in Store type ({len(not_in_type)}):")
            for v in sorted(not_in_type): print(f"     - {v}")
        if stubs:
            print(f"\n   ✗ In type but not consumed by UI ({len(stubs)}):")
            for v in sorted(stubs): print(f"     - {v}")
        print(f"\n   → These tests will be SKIPPED in Playwright.")


if __name__ == "__main__":
    main()
