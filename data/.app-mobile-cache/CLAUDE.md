# SellerAppMobile - Guía para Claude

## Arquitectura de sincronización incremental

Los modelos de Realm que se sincronizan desde la API usan un patrón de **sync incremental** basado en dos campos:

- `onChangeTimestamp` (String): Timestamp de la última modificación del registro en el servidor.
- `deletedAt` (String): Si tiene valor, indica que fue soft-deleted en el servidor.

### Patrón de sync incremental

1. Antes de llamar a la API, se obtiene el mayor `onChangeTimestamp` de los registros existentes en Realm.
2. Se pasa como query param `onChangeTimestampFrom` a la API para recibir solo los cambios desde esa fecha.
3. Si no hay registros en Realm (primera sync), se envía `null` y la API retorna todos.
4. Con la respuesta:
   - Los registros con `deletedAt != null` se eliminan de Realm.
   - El resto se upsertea con `copyToRealmOrUpdate`.

### Clases clave

- **`ISyncableRealmData`** (`utils/`): Interfaz que todo modelo sincronizable debe implementar (`getOnChangeTimestamp()`, `getDeletedAt()`, `get_id()`).
- **`SyncRealmHelper`** (`utils/`): Helper con métodos estáticos reutilizables:
  - `getLatestOnChangeTimestamp(Class<T>)` — obtiene el último timestamp de Realm.
  - `applyIncrementalSync(List<T>, Class<T>)` — aplica la lógica de delete/upsert.

### Modelos que ya implementan este patrón

- `CreateCommerceQuestionAdditionalOptionsData`
- `DocumentData` (pending-documents)

### Cómo agregar sync incremental a un nuevo modelo

1. Agregar campos `onChangeTimestamp` (String) y `deletedAt` (String) al modelo.
2. Implementar `ISyncableRealmData`.
3. Agregar migración en `Migration.java` con `addFieldIfPossible`.
4. Incrementar `SCHEMA_VERSION` en `MigrationConstants.java`.
5. Agregar `@Query("onChangeTimestampFrom")` al endpoint en `IYomApi` o `IYomAdmin`.
6. En la función de sync en `SyncClient`, usar `SyncRealmHelper.getLatestOnChangeTimestamp()` y la lógica de separar deletes de upserts.

## Realm y migraciones

- Schema version actual: ver `MigrationConstants.SCHEMA_VERSION`.
- Las migraciones van en `model/migrations/Migration.java` con bloques `if (oldVersion <= X)`.
- Para `RealmList<String>` usar `addRealmListFieldIfPossible(schema, fieldName, String.class)`.
- Para campos simples usar `addFieldIfPossible(schema, fieldName, Type.class)`.

## Cómo obtener datos de sesión

- Seller actual: `SellerConfig.getInstance().getSeller()` retorna un `Seller` con `externalSellerId`, `name`, `email`, etc.
- Site actual: `SiteConfig.getInstance().getSite()`.

## Pending Documents (DocumentData)

- Endpoint: `pending-documents/seller` en `IYomApi`.
- Los documentos pueden tener `externalSellerId` (RealmList<String>) y `previousExternalSellerIds` (RealmList<String>).
- Durante la sync, si el sellerId de la sesión actual no aparece en `externalSellerId` del documento, se debe descartar (no agregar a Realm o eliminar si existe).
