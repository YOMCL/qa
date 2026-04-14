#!/bin/bash
# Corre todos los flows Maestro para un cliente y genera reporte en el dashboard QA
# Uso: ./tools/run-maestro.sh <cliente>
# Ejemplo: ./tools/run-maestro.sh prinorte

set -euo pipefail

# ── Config ───────────────────────────────────────────────────
CLIENTE="${1:-}"
if [ -z "$CLIENTE" ]; then
    echo "Uso: ./tools/run-maestro.sh <cliente>"
    echo "Ejemplo: ./tools/run-maestro.sh prinorte"
    exit 1
fi

DATE=$(date +%Y-%m-%d)
QA_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$QA_ROOT/tests/app/config/env.${CLIENTE}.yaml"
FLOWS_DIR="$QA_ROOT/tests/app/flows"
CLIENTE_CAP=$(python3 -c "print('${CLIENTE}'.capitalize())")
OUTPUT_DIR="$QA_ROOT/QA/${CLIENTE_CAP}/${DATE}"
PUBLIC_DIR="$QA_ROOT/public/app-reports"
MANIFEST_FILE="$PUBLIC_DIR/manifest.json"
REPORT_FILE="${CLIENTE}-${DATE}.html"
REPORT_PATH="$PUBLIC_DIR/${REPORT_FILE}"
RAW_LOG="${OUTPUT_DIR}/maestro.log"

# ── Validaciones ──────────────────────────────────────────────
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Env file no encontrado: $ENV_FILE"
    echo "   Esperado: tests/app/config/env.${CLIENTE}.yaml"
    exit 1
fi

FLOW_COUNT=$(ls "$FLOWS_DIR"/${CLIENTE}-[0-9]*.yaml 2>/dev/null | wc -l | tr -d ' ')
if [ "$FLOW_COUNT" -eq 0 ]; then
    echo "❌ No hay flows para: $CLIENTE"
    echo "   Esperado: tests/app/flows/${CLIENTE}-NN-*.yaml"
    exit 1
fi

# ── Setup Java/ADB ────────────────────────────────────────────
JAVA_PREFIX=$(brew --prefix openjdk@17 2>/dev/null || true)
[ -n "$JAVA_PREFIX" ] && export JAVA_HOME="$JAVA_PREFIX" && export PATH="$JAVA_HOME/bin:$PATH"
export PATH="$HOME/Library/Android/sdk/platform-tools:$PATH"

mkdir -p "$OUTPUT_DIR" "$PUBLIC_DIR"

echo "📱 Maestro QA — ${CLIENTE_CAP} — ${DATE}"
echo "   ${FLOW_COUNT} flows encontrados"
echo ""

# ── Verificar dispositivo ─────────────────────────────────────
if ! adb devices 2>/dev/null | grep -q "device$"; then
    echo "❌ No hay dispositivo Android conectado"
    echo "   Conecta el celu con USB debugging activado"
    exit 1
fi

# ── Correr flows (Python maneja quoting de --env args) ────────
echo "▶ Iniciando flows (máx 3 intentos por flow)..."
python3 - "$ENV_FILE" "$FLOWS_DIR" "$CLIENTE" "$RAW_LOG" <<'PYEOF'
import sys, yaml, subprocess, os, glob, re

env_file  = sys.argv[1]
flows_dir = sys.argv[2]
cliente   = sys.argv[3]
log_file  = sys.argv[4]

with open(env_file) as f:
    env_data = yaml.safe_load(f) or {}

base_cmd = ['maestro', 'test']
for k, v in env_data.items():
    if v is not None and str(k).strip():
        base_cmd.extend(['--env', f'{k}={v}'])

flows = sorted(glob.glob(os.path.join(flows_dir, f'{cliente}-[0-9]*.yaml')))

log_lines = []

for flow_path in flows:
    # Extraer nombre del campo name: en el YAML, fallback al basename
    flow_name = os.path.splitext(os.path.basename(flow_path))[0]
    try:
        with open(flow_path) as f:
            flow_yaml = yaml.safe_load(f)
            if isinstance(flow_yaml, dict) and flow_yaml.get('name'):
                flow_name = flow_yaml['name']
    except Exception:
        pass

    print(f"\n{'─'*50}")
    print(f"▶ {flow_name}")

    passed = False
    last_output = ''
    last_error = ''

    for attempt in range(1, 4):
        result = subprocess.run(
            base_cmd + [flow_path],
            stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True
        )
        last_output = result.stdout
        print(last_output, end='')

        if result.returncode == 0:
            passed = True
            break
        else:
            non_empty = [l for l in last_output.splitlines() if l.strip()]
            last_error = ' | '.join(non_empty[-3:]) if non_empty else 'Error desconocido'
            if attempt < 3:
                print(f"  ↺ Intento {attempt}/3 fallido — reintentando...")
            else:
                print(f"  ✗ 3 intentos fallidos — marcando como FAILED")

    # Extraer duración del output (formato "3s 234ms" o "3.234s")
    dur_match = re.search(r'(\d+s \d+ms|\d+\.\d+s|\d+ms)', last_output)
    duration = dur_match.group(1) if dur_match else '?'

    if passed:
        log_lines.append(f'[Passed] {flow_name} ({duration})')
    else:
        # Limpiar error para que no rompa el parser de HTML (una sola línea)
        error_clean = last_error.replace('\n', ' ').replace('\r', '')[:120]
        log_lines.append(f'[Failed] {flow_name} ({duration}) ({error_clean})')

combined_log = '\n'.join(log_lines)
print(f"\n{'─'*50}")
print(combined_log)
with open(log_file, 'w') as f:
    f.write(combined_log + '\n')
PYEOF

echo ""

# ── Generar reporte HTML + actualizar manifest ────────────────
python3 - "$CLIENTE_CAP" "$CLIENTE" "$DATE" "$RAW_LOG" "$REPORT_PATH" "$MANIFEST_FILE" "$REPORT_FILE" <<'PYEOF'
import sys, re, json, os
from datetime import datetime
from html import escape

client_cap   = sys.argv[1]
client_slug  = sys.argv[2]
date_str     = sys.argv[3]
log_file     = sys.argv[4]
report_path  = sys.argv[5]
manifest_file = sys.argv[6]
report_file  = sys.argv[7]

# ── Parsear log ───────────────────────────────────────────────
with open(log_file) as f:
    lines = f.read().splitlines()

flows = []
for line in lines:
    m = re.match(r'\[(Passed|Failed)\]\s+(.+?)\s+\(([^)]+)\)(?:\s+\((.+)\))?', line.strip())
    if m:
        flows.append({
            'name':     m.group(2),
            'status':   m.group(1).lower(),
            'duration': m.group(3),
            'error':    m.group(4) or '',
        })

passed  = sum(1 for f in flows if f['status'] == 'passed')
failed  = len(flows) - passed
total   = len(flows)
health  = round(passed / total * 100) if total > 0 else 0

health_color = '#10b981' if health >= 80 else '#f59e0b' if health >= 60 else '#ef4444'
verdict      = 'LISTO' if health == 100 else 'CON OBSERVACIONES' if health >= 70 else 'BLOQUEADO'
verdict_cls  = 'listo' if health == 100 else 'condiciones' if health >= 70 else 'bloqueado'

# ── Filas de la tabla ─────────────────────────────────────────
rows = ''
for f in flows:
    icon      = '✅' if f['status'] == 'passed' else '❌'
    badge_cls = 'pass' if f['status'] == 'passed' else 'fail'
    err_html  = f'<div class="flow-error">{escape(f["error"])}</div>' if f['error'] else ''
    rows += f"""
        <tr>
            <td><span class="flow-icon">{icon}</span> {escape(f['name'])}{err_html}</td>
            <td><span class="badge {badge_cls}">{f['status'].upper()}</span></td>
            <td class="duration">{escape(f['duration'])}</td>
        </tr>"""

generated_at = datetime.now().strftime("%Y-%m-%d %H:%M")

# ── HTML ──────────────────────────────────────────────────────
html = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>APP QA — {escape(client_cap)} — {date_str}</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh; padding: 40px 20px;
        }}
        .container {{ max-width: 860px; margin: 0 auto; }}
        .back-link {{ color: rgba(255,255,255,0.8); text-decoration: none; font-size: 0.9em; display: inline-block; margin-bottom: 16px; }}
        .back-link:hover {{ color: white; }}
        header {{ color: white; margin-bottom: 24px; }}
        header h1 {{ font-size: 1.9em; margin-bottom: 4px; }}
        header p {{ opacity: 0.8; font-size: 0.95em; }}
        .card {{ background: white; border-radius: 14px; padding: 28px; margin-bottom: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.18); }}
        .card-title {{ font-size: 1.05em; font-weight: 700; color: #111827; margin-bottom: 18px; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb; }}
        .stats {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }}
        .stat {{ background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 14px; border-radius: 10px; text-align: center; }}
        .stat.green {{ background: linear-gradient(135deg, #10b981, #059669); }}
        .stat.red {{ background: linear-gradient(135deg, #ef4444, #dc2626); }}
        .stat.amber {{ background: linear-gradient(135deg, #f59e0b, #d97706); }}
        .stat-value {{ font-size: 1.8em; font-weight: 800; line-height: 1; }}
        .stat-label {{ font-size: 0.72em; opacity: 0.9; font-weight: 600; margin-top: 4px; }}
        .verdict-badge {{ display: inline-block; padding: 6px 18px; border-radius: 99px; font-weight: 700; font-size: 0.9em; margin-bottom: 18px; }}
        .verdict-listo {{ background: #d1fae5; color: #065f46; }}
        .verdict-condiciones {{ background: #fef3c7; color: #92400e; }}
        .verdict-bloqueado {{ background: #fee2e2; color: #991b1b; }}
        .health-bar {{ margin-bottom: 8px; }}
        .health-meta {{ display: flex; justify-content: space-between; font-size: 0.82em; color: #6b7280; font-weight: 600; margin-bottom: 5px; }}
        .health-meta strong {{ color: #111827; }}
        .health-track {{ height: 10px; background: #f3f4f6; border-radius: 99px; overflow: hidden; }}
        .health-fill {{ height: 100%; border-radius: 99px; background: {health_color}; }}
        table {{ width: 100%; border-collapse: collapse; }}
        th {{ background: #f9fafb; text-align: left; padding: 10px 14px; font-size: 0.78em; color: #6b7280; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1.5px solid #e5e7eb; }}
        td {{ padding: 10px 14px; border-bottom: 1px solid #f3f4f6; font-size: 0.88em; vertical-align: top; }}
        tr:last-child td {{ border-bottom: none; }}
        .badge {{ padding: 2px 10px; border-radius: 99px; font-size: 0.75em; font-weight: 700; }}
        .badge.pass {{ background: #d1fae5; color: #065f46; }}
        .badge.fail {{ background: #fee2e2; color: #991b1b; }}
        .flow-error {{ font-size: 0.8em; color: #9ca3af; margin-top: 3px; font-style: italic; }}
        .duration {{ color: #9ca3af; white-space: nowrap; }}
        footer {{ color: rgba(255,255,255,0.7); font-size: 0.82em; text-align: center; margin-top: 24px; }}
    </style>
</head>
<body>
<div class="container">
    <a href="../" class="back-link">← Dashboard principal</a>
    <header>
        <h1>📱 APP QA — {escape(client_cap)}</h1>
        <p>Maestro flows · {date_str}</p>
    </header>

    <div class="card">
        <div class="card-title">Resumen</div>
        <span class="verdict-badge verdict-{verdict_cls}">{verdict}</span>
        <div class="stats">
            <div class="stat"><div class="stat-value">{total}</div><div class="stat-label">Total flows</div></div>
            <div class="stat green"><div class="stat-value">{passed}</div><div class="stat-label">Passed</div></div>
            <div class="stat red"><div class="stat-value">{failed}</div><div class="stat-label">Failed</div></div>
            <div class="stat amber"><div class="stat-value">{health}%</div><div class="stat-label">Health</div></div>
        </div>
        <div class="health-bar">
            <div class="health-meta"><span>Health score</span><strong>{health}%</strong></div>
            <div class="health-track"><div class="health-fill" style="width:{health}%"></div></div>
        </div>
    </div>

    <div class="card">
        <div class="card-title">Detalle por flow</div>
        <table>
            <thead><tr><th>Flow</th><th>Estado</th><th>Duración</th></tr></thead>
            <tbody>{rows}</tbody>
        </table>
    </div>

    <footer>Generado {generated_at} · Maestro + YOM QA</footer>
</div>
</body>
</html>"""

with open(report_path, 'w') as f:
    f.write(html)

# ── Actualizar manifest ───────────────────────────────────────
manifest = {'reports': []}
if os.path.exists(manifest_file):
    try:
        with open(manifest_file) as f:
            manifest = json.load(f)
    except Exception:
        pass

manifest['reports'] = [
    r for r in manifest.get('reports', [])
    if not (r.get('client_slug') == client_slug and r.get('date') == date_str)
]
manifest['reports'].append({
    'client':       client_cap,
    'client_slug':  client_slug,
    'date':         date_str,
    'file':         report_file,
    'passed':       passed,
    'failed':       failed,
    'total':        total,
    'health':       health,
    'verdict':      verdict,
})
manifest['reports'].sort(key=lambda x: x['date'], reverse=True)

with open(manifest_file, 'w') as f:
    json.dump(manifest, f, indent=2, ensure_ascii=False)

print(f"✅  Reporte: public/app-reports/{report_file}")
print(f"📊  {passed}/{total} flows pasaron · Health {health}% · {verdict}")
PYEOF

echo ""
echo "🌐 Dashboard: abre public/index.html"
