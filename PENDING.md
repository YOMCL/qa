# Pendientes QA Repo

> Generado 2026-04-19 después de auditoría completa del repo.

---

## 🔴 Seguridad — Solo si el repo tiene acceso externo

Las siguientes credenciales quedaron en historial git. Si el repo es **privado y solo lo ve el equipo YOM**, el riesgo es bajo y no es urgente actuar. Si alguna vez se hace público o hay colaboradores externos, rotar antes:

- MongoDB Atlas `eduardo_jimenez` / `WGXXD4oruVe6iXH1` → commits `5f86f09`, `1e53e70`
- Password `laloyom123` de `eduardo@yom.ai` → commits `6b86b77`, `bb0dd3e`
- `.gitignore` ya previene que vuelva a ocurrir

---

## 🟡 QA Pipeline — Gaps funcionales

### 3. Admin tests sin credenciales
Los specs `tests/e2e/admin/*.spec.ts` saltan automáticamente porque `ADMIN_PASSWORD` está vacío en `.env`.

**Acción:** Agregar a `tests/e2e/.env`:
```
ADMIN_PASSWORD=<contraseña real>
```
Los specs ya tienen el guard correcto — una vez agregada la var, corren solos.

### 4. Smoke test de producción (youorder.me)
No existe validación automatizada post-deploy en producción. Un cliente puede pasar QA en staging y tener issues en prod si las configs de MongoDB difieren entre entornos.

**Plan sugerido:** Crear un smoke test acotado (~3-4 checks) que corra contra `youorder.me`:
- Login funciona
- Catálogo carga
- Agregar al carrito funciona
- Sin crear órdenes reales ni limpiar estado

Usar `--env production` en extractor para generar un `qa-matrix-prod.json` con URLs de youorder.me.

---

## 🟢 Organizacional — Baja urgencia

### 5. Documentar `MONGO_INTEGRATIONS_STAGING_URI` en .env.example
El `.env.example` raíz no existe (solo el de `tests/e2e/`). Agregar un `.env.example` raíz con las variables que espera `mongo-extractor.py`:
```
MONGO_LEGACY_URI=
MONGO_MICRO_URI=
MONGO_INTEGRATIONS_URI=
MONGO_LEGACY_STAGING_URI=
MONGO_MICRO_STAGING_URI=
MONGO_INTEGRATIONS_STAGING_URI=
```

### 6. Verificar flows Maestro legacy en `_legacy/`
Los 13 flows movidos a `tests/app/flows/_legacy/` tienen casos de prueba valiosos (deuda técnica PM3, 08-pagos, 09-concurrencia) que podrían migrarse al patrón de sesión cuando se onboardee un nuevo cliente con app.

---

## Referencia: qué se arregló en esta sesión (2026-04-19)

- `run-all.sh` eliminado → reemplazado por `run-prinorte.sh`
- `config.prinorte.yaml` y `env.prinorte.yaml` removidos de git tracking
- `.gitignore` actualizado: `env.*.yaml`, `config.*.yaml` (con excepción para `.example.yaml`)
- `selectCommerceHelper`: reemplazado `text=Eduardo` hardcodeado por nombre derivado del email
- Flows legacy 01-13 movidos a `_legacy/`
- `orders.spec.ts` B2B: eliminado `test.skip(true)` permanente
- `qa-client-validation.md`: removida referencia a `clients-staging.ts` y `--project=staging`
- INDICE.md: 4 specs mapeadas, 1 spec fantasma eliminada
- CLAUDE.md: pipeline corregido con `--env staging/production`, orden Playwright → Cowork
- `.env.example` (e2e): actualizado con 6 clientes activos
- `config.example.yaml`: creado para onboarding Maestro
- `qa-plan-client.md` y `run-playwright.md`: referencias outdated corregidas
