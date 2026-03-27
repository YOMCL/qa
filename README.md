# QA — YOM

Suite de QA para la plataforma YOM: B2B, APP mobile y Admin.

Cubre testing automatizado (Playwright E2E, Maestro mobile), generación de checklists por cliente desde MongoDB, y proceso operacional de puesta en marcha.

## Estructura

```
qa/
├── data/                          # Datos de clientes y config
│   ├── mongo-extractor.py         # Extrae config de MongoDB por cliente
│   ├── qa-matrix.json             # Config extraída (generado, no commitear)
│   ├── features-clientes-2026.csv # Features activas por cliente
│   ├── variables-por-cliente.md   # Diccionario de variables MongoDB
│   └── cruce-tests-variables-clientes.md  # Matriz tests × variables × clientes
│
├── tests/
│   ├── e2e/                       # Playwright — E2E para B2B web
│   │   ├── b2b/                   # Specs: login, catalog, cart, checkout, prices
│   │   ├── fixtures/              # Auth helper, clients config
│   │   └── playwright.config.ts
│   └── app/                       # Maestro — Smoke tests APP mobile
│       ├── flows/                 # YAML flows: login, sync, pedido, etc.
│       └── config/                # Env config para Maestro
│
├── tools/
│   ├── checklist-generator.py     # Genera checklist QA por cliente
│   ├── generate_features_csv.py   # Genera CSV features × clientes desde Excel
│   ├── run-qa.sh                  # Script orquestador: mongo → checklist → playwright
│   └── cowork-qa-b2b.md          # Prompt para QA con Claude Cowork
│
├── templates/
│   ├── qa-report-template.md      # Template reporte QA con health score
│   └── escalation-templates.md    # Templates Slack por tipo de issue
│
├── references/
│   └── issue-taxonomy.md          # Severidades, categorías, escalamiento
│
├── QA/                            # Resultados por cliente y fecha
│   ├── Soprole/2026-03-25/
│   └── Tienda/2026-03-25/
│
├── plan-qa-b2b.md                 # Estrategia QA B2B (3 capas)
├── qa-app-strategy.md             # Estrategia QA APP mobile
├── qa-master-prompt.md            # Documento madre: ~80 casos, fixtures, esquemas
├── playbook-qa-cliente-nuevo.md   # Paso a paso para QA de cliente nuevo
├── checklist-puesta-en-marcha-app.md  # Checklist APP ejecutado (Tienda)
├── casos-prioritarios-diego.md    # Casos de test priorizados para Diego (B2B)
├── reunion-qa-automatizado.md     # Acta reunión con Tech (25/03/2026)
├── reporte-exploracion-repos.md   # Hallazgos reales de repos YOM
└── SKILL.md                       # Flujo operacional QA PeM
```

## Setup

### Requisitos

- Python 3.9+
- Node.js 20+
- MongoDB access (para `mongo-extractor.py`)
- Android Studio (para Maestro — opcional)

### Credenciales

```bash
# Root — MongoDB (para extractor)
cp .env.example .env
# Completar con credenciales reales

# Playwright — B2B
cp tests/e2e/.env.example tests/e2e/.env
# Completar con credenciales del comercio

# Maestro — APP
cp tests/app/config/env.example.yaml tests/app/config/env.yaml
# Completar con credenciales del vendedor
```

### Playwright (E2E B2B)

```bash
cd tests/e2e
npm install
npx playwright install chromium
npx playwright test
```

### Maestro (APP mobile)

```bash
# Instalar Maestro
curl -Ls "https://get.maestro.mobile.dev" | bash

# Correr flows
cd tests/app
maestro test flows/
```

## Uso

### QA completo de un cliente

```bash
./tools/run-qa.sh Soprole
```

Esto ejecuta: extrae config de MongoDB → genera checklist → corre Playwright.

### Generar checklist manual

```bash
python3 tools/checklist-generator.py --cliente Soprole -o QA/Soprole/2026-03-26/checklist.md
```

### Correr solo Playwright

```bash
cd tests/e2e
npx playwright test                    # Todos los tests
npx playwright test b2b/login.spec.ts  # Solo login
npx playwright test --headed           # Con browser visible
npx playwright show-report             # Ver reporte HTML
```

## Proceso QA cliente nuevo

Ver [playbook-qa-cliente-nuevo.md](playbook-qa-cliente-nuevo.md) para el paso a paso completo:

1. Generar checklist con `checklist-generator.py`
2. Correr Playwright (B2B automatizado)
3. Explorar B2B con Cowork (validación visual)
4. Testear APP en dispositivo
5. Documentar y escalar issues
6. Veredicto: LISTO / CON CONDICIONES / NO APTO

## Escalamiento de issues

| Tipo | Equipo | Canal Slack |
|---|---|---|
| Bug de código | Tech (Rodrigo/Diego C) | `#tech` |
| Datos incorrectos | Analytics (Diego F/Nicole) | `#datos` |
| Configuración | Tech | `#tech` |
| Integración ERP | Analytics + Tech | `#integraciones` |
| Contenido del cliente | CS (Max) → Cliente | `#pem` |

Templates en [templates/escalation-templates.md](templates/escalation-templates.md).

## Documentos clave

| Documento | Contenido |
|---|---|
| [qa-master-prompt.md](qa-master-prompt.md) | Casos de prueba Tier 1-3, fixtures, esquemas de datos, reglas |
| [plan-qa-b2b.md](plan-qa-b2b.md) | Estrategia 3 capas: E2E + unit tests + Cowork |
| [qa-app-strategy.md](qa-app-strategy.md) | Estrategia APP: smoke tests → dispositivo físico → monitoreo |
| [casos-prioritarios-diego.md](casos-prioritarios-diego.md) | 29 casos priorizados para hooks y servicios del B2B |
| [reporte-exploracion-repos.md](reporte-exploracion-repos.md) | Stack real de cada repo (APP, B2B, API) |
