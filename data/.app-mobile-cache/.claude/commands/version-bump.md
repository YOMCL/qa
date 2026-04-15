# Version Bump

Realiza un bump de versión para el proyecto SellerAppMobile y su submodulo android (yom-sales).

## Parámetros

Se requieren 2 argumentos:
- `nueva_version`: La nueva versión en formato X.Y.Z (ej: 7.0.0, 7.1.0, 7.1.1)
- `nuevo_version_code`: El nuevo versionCode para Android (número entero, ej: 686)

El usuario debe invocar este comando indicando la versión y el versionCode deseados. Ejemplo: `/version-bump 7.1.0 687`

Si no se proporcionan argumentos: $ARGUMENTS, pedir al usuario que los proporcione.

## Instrucciones

### 1. Parsear argumentos

Extraer `nueva_version` y `nuevo_version_code` de los argumentos proporcionados: $ARGUMENTS

Separar la versión en sus componentes major, minor y fix.

### 2. Verificar ramas base

- SellerAppMobile debe estar en la rama `production`. Si no lo está, hacer checkout a `production` y pull.
- El submodulo android debe estar en la rama `production-native`. Si no lo está, hacer checkout a `production-native` y pull.

### 3. Crear ramas de trabajo

Determinar el siguiente número de rama buscando ramas existentes con patrón `*/version-*` y usando el siguiente número disponible.

- En android (submodulo): crear rama `{N}/version-{nueva_version}` desde `production-native`
- En SellerAppMobile: crear rama `{N}/version-{nueva_version}` desde `production`

### 4. Modificar archivos en android (submodulo)

**android/app/build.gradle:**
- Cambiar `versionCode` al valor de `nuevo_version_code`

**android/version.properties:**
- Actualizar `major`, `minor`, `fix` según los componentes de `nueva_version`
- Establecer `preRelease=` (vacío)

### 5. Modificar archivos en SellerAppMobile

**src/config/version.json:**
- Actualizar `version` a `nueva_version`
- Actualizar `major`, `minor`, `fix` según los componentes
- Establecer `preRelease` a `""`

### 6. Commit y push en android (submodulo)

```
git add app/build.gradle version.properties
git commit -m "{nuevo_version_code} - {nueva_version}"
git push -u origin {N}/version-{nueva_version}
```

### 7. Crear PR en android (yom-sales)

```
gh pr create --base production-native --title "{nuevo_version_code} - {nueva_version}" --body "..."
```

Con body que incluya:
- Summary: bump de versionCode y versión
- Test plan: verificar build y versión en APK

### 8. Commit y push en SellerAppMobile

Incluir los cambios de version.json, el submodulo android actualizado, y el archivo de este comando si es nuevo.

```
git add src/config/version.json android .claude/commands/version-bump.md
git commit -m "update version {nueva_version}"
git push -u origin {N}/version-{nueva_version}
```

### 9. Crear PR en SellerAppMobile (app-mobile)

```
gh pr create --base production --title "{nuevo_version_code} - {nueva_version}" --body "..."
```

Con body que incluya:
- Summary: bump de versión en version.json y referencia del submodulo android
- Test plan: verificar build en ambas plataformas

### 10. Resultado

Mostrar al usuario las URLs de ambos PRs creados.
