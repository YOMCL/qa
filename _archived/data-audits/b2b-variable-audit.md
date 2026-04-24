# B2B Variable Audit — Exhaustive Review

**Generated**: 2026-04-15 10:24:10 UTC

## Executive Summary

| Metric | Count | Status |
|--------|-------|--------|
| Total Unconfirmed Variables | 74 | ⚠️ All analyzed |
| Found in B2B Code | 0 | ✗ None |
| Backend-Only (API-controlled) | 35 | ⚠️ Need verification |
| Dead/Unused | 39 | 🗑️ Cleanup candidates |

## Critical Finding

**All 74 unconfirmed variables are ABSENT from B2B source code.**


This indicates:
- **Pure API-driven features**: Backend controls these via feature flags
- **Lazy consumption pattern**: Frontend accepts them if available in store
- **Potential gaps**: Frontend may not properly consume or handle these flags
- **Technical debt**: Legacy features or infrastructure not actively maintained


## Detailed Analysis

### Search Methodology


**Scope**: `data/.b2b-source-cache/src/`
- 930 files (.ts, .tsx)
- Excluded: `__tests__`, `__mocks__`, `.d.ts`

**Patterns searched**:
1. `useStore('varName')` and `useStore("varName")`
2. Nested property access (e.g., `payment.foo`)
3. Dynamic feature flag consumption

**Result**: 0/74 variables found


### Client Data Source


**File**: `data/qa-matrix-staging.json`
**Clients**: 4 staging environments
- codelpa-staging (62 variables configured)
- marleycoffee-staging (89 variables configured)
- prisa-staging (94 variables configured)
- new-soprole-staging (81 variables configured)

**Legend**:
- ✓ = True (enabled)
- ✗ = False (disabled)
- — = null or not set
- ∆ = custom value (string, array, object)


---

## Backend-Only Variables (35)

These are **NOT in B2B code** but **ACTIVE in at least one client**.

### Quick Reference Table

| Variable | codelpa | marleycoffee | prisa | new-soprole |
|----------|---------|--------------|-------|-------------|
| blockedClientAlert.enableBlockedClien... | — | — | — | ✓ |
| disableCommerceEdit | ✓ | — | — | — |
| disableWrongPrices | — | — | — | ✓ |
| editAddress | — | ✓ | ✓ | — |
| enableBetaButtons | — | — | — | ✓ |
| enableChooseSaleUnit | — | — | ✓ | ✓ |
| enableCoupons | — | ✓ | ✓ | ✓ |
| enableMassiveOrderSend | ✓ | — | — | — |
| enableOrderApproval | ✓ | — | ✓ | — |
| enableOrderValidation | ✓ | — | — | — |
| enablePayments | — | — | — | ✓ |
| enablePaymentsCollection | — | — | — | ✓ |
| enableSellerDiscount | ✓ | — | ✓ | ✓ |
| enableTask | ✓ | — | — | ✓ |
| footerCustomContent.useFooterCustomCo... | — | — | — | ✓ |
| hasAllDistributionCenters | ✓ | — | — | — |
| hasNoSaleFilter | ✓ | — | ✓ | — |
| hasSingleDistributionCenter | — | ✓ | ✓ | ✓ |
| hasStockEnabled | ✓ | — | ✓ | ✓ |
| hideReceiptType | ✓ | — | — | ✓ |
| includeTaxRateInPrices | — | ✓ | ✓ | — |
| limitAddingByStock | — | — | ✓ | — |
| packagingInformation.hidePackagingInf... | — | ✓ | ✓ | — |
| packagingInformation.hideSingleItemPa... | ✓ | ✓ | ✓ | — |
| payment.enableNewPaymentModule | ✓ | — | — | ✓ |
| payment.requiresFullPayment | — | — | — | ✓ |
| payment.walletEnabled | — | — | — | ✓ |
| pendingDocuments | ✓ | — | — | — |
| purchaseOrderEnabled | ✓ | — | — | — |
| shoppingDetail.lastOrder | ✓ | — | — | ✓ |
| showMinOne | — | — | — | ✓ |
| suggestions.enableSortingByCategories | ✓ | — | — | — |
| taxes.showSummary | ✓ | — | — | ✓ |
| useMobileGps | ✓ | — | — | — |
| useNewPromotions | ✓ | — | ✓ | ✓ |

### Detailed Entries


#### 1. `blockedClientAlert.enableBlockedClientAlert`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: True

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 2. `disableCommerceEdit`

**Status by Client**

  - **codelpa**: True
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 3. `disableWrongPrices`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: True

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 4. `editAddress`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: True
  - **prisa**: True
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 5. `enableBetaButtons`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: True

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 6. `enableChooseSaleUnit`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: True
  - **new**: True

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 7. `enableCoupons`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: True
  - **prisa**: True
  - **new**: True

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 8. `enableMassiveOrderSend`

**Status by Client**

  - **codelpa**: True
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 9. `enableOrderApproval`

**Status by Client**

  - **codelpa**: True
  - **marleycoffee**: —
  - **prisa**: True
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 10. `enableOrderValidation`

**Status by Client**

  - **codelpa**: True
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 11. `enablePayments`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: True

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 12. `enablePaymentsCollection`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: True

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 13. `enableSellerDiscount`

**Status by Client**

  - **codelpa**: True
  - **marleycoffee**: —
  - **prisa**: True
  - **new**: True

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 14. `enableTask`

**Status by Client**

  - **codelpa**: True
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: True

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 15. `footerCustomContent.useFooterCustomContent`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: True

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 16. `hasAllDistributionCenters`

**Status by Client**

  - **codelpa**: True
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 17. `hasNoSaleFilter`

**Status by Client**

  - **codelpa**: True
  - **marleycoffee**: —
  - **prisa**: True
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 18. `hasSingleDistributionCenter`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: True
  - **prisa**: True
  - **new**: True

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 19. `hasStockEnabled`

**Status by Client**

  - **codelpa**: True
  - **marleycoffee**: —
  - **prisa**: True
  - **new**: True

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 20. `hideReceiptType`

**Status by Client**

  - **codelpa**: True
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: True

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 21. `includeTaxRateInPrices`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: True
  - **prisa**: True
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 22. `limitAddingByStock`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: True
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 23. `packagingInformation.hidePackagingInformationB2B`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: True
  - **prisa**: True
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 24. `packagingInformation.hideSingleItemPackagingInformationB2B`

**Status by Client**

  - **codelpa**: True
  - **marleycoffee**: True
  - **prisa**: True
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 25. `payment.enableNewPaymentModule`

**Status by Client**

  - **codelpa**: True
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: True

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 26. `payment.requiresFullPayment`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: True

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 27. `payment.walletEnabled`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: True

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 28. `pendingDocuments`

**Status by Client**

  - **codelpa**: True
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 29. `purchaseOrderEnabled`

**Status by Client**

  - **codelpa**: True
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 30. `shoppingDetail.lastOrder`

**Status by Client**

  - **codelpa**: True
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: True

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 31. `showMinOne`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: True

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 32. `suggestions.enableSortingByCategories`

**Status by Client**

  - **codelpa**: True
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 33. `taxes.showSummary`

**Status by Client**

  - **codelpa**: True
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: True

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 34. `useMobileGps`

**Status by Client**

  - **codelpa**: True
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

#### 35. `useNewPromotions`

**Status by Client**

  - **codelpa**: True
  - **marleycoffee**: —
  - **prisa**: True
  - **new**: True

**Analysis**
- Not found in B2B codebase
- Controlled entirely via backend API
- Frontend should consume if present in store

---

## Dead/Unused Variables (39)

These are **NOT in B2B code** and **INACTIVE across all clients**.

### Quick Reference Table

| Variable | codelpa | marleycoffee | prisa | new-soprole |
|----------|---------|--------------|-------|-------------|
| blockedClientAlert.blockedClientAlert... | — | — | — | ∆ |
| businessUnits | — | ∆ | ∆ | — |
| confirmCartText | — | — | — | ∆ |
| disableCart | — | — | — | — |
| disablePayments | — | — | — | — |
| disableShowEstimatedDeliveryHour | — | — | — | — |
| disableSyncDate | — | — | — | — |
| discountTypes.discountTypesList | — | ∆ | ∆ | — |
| discountTypes.enableOrderDiscountType | — | — | — | — |
| discountTypes.enableProductDiscountType | — | — | — | — |
| enableAskDeliveryDate | — | — | — | — |
| enableCreditNotes | — | — | — | — |
| enableDialogNoSellReason | — | — | — | — |
| enableNewUI | — | — | — | — |
| filterGroupedSuggestionsBy | — | ∆ | ∆ | — |
| hasMultipleBusinessUnit | — | — | — | — |
| hasTransferPaymentType | — | — | — | — |
| hasTransportCode | — | — | — | — |
| hasVoucherPrinterEnabled | — | — | — | — |
| hidePrices | — | — | — | — |
| lazyLoadingPrices | — | — | — | — |
| ordersRequireAuthorization | — | — | — | — |
| ordersRequireVerification | — | — | — | — |
| packagingInformation.ignoreUnitOnPack... | — | — | — | — |
| payment.balances | — | ∆ | ∆ | ∆ |
| paymentsWithoutAccount | — | — | — | — |
| pointsEnabled | — | — | — | — |
| priceRoundingDecimals | — | ∆ | ∆ | ∆ |
| shareOrderNewDesign | — | — | — | — |
| synchronization.backgroundSyncList | — | ∆ | ∆ | — |
| synchronization.enableBackgroundSendO... | — | — | — | — |
| synchronization.enableBackgroundSync | — | — | — | — |
| synchronization.enableSyncImages | — | — | — | — |
| taxes.taxRate | ∆ | ∆ | ∆ | ∆ |
| uploadOrderFileWithMinUnits | — | — | — | — |
| validatePaymentFromAdmin | — | — | — | — |
| weightInfo | — | — | — | — |
| wrongPrices.block | — | — | — | — |
| wrongPrices.threshold | — | — | — | ∆ |

### Detailed Entries


#### 1. `blockedClientAlert.blockedClientAlertHtmlContent`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: "<div class="text-center">
  <h4>Tu comercio se ..."

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 2. `businessUnits`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: [list]
  - **prisa**: [list]
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 3. `confirmCartText`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: "Pasar a confirmación del pedido"

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 4. `disableCart`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 5. `disablePayments`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 6. `disableShowEstimatedDeliveryHour`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 7. `disableSyncDate`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 8. `discountTypes.discountTypesList`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: [list]
  - **prisa**: [list]
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 9. `discountTypes.enableOrderDiscountType`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 10. `discountTypes.enableProductDiscountType`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 11. `enableAskDeliveryDate`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 12. `enableCreditNotes`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 13. `enableDialogNoSellReason`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 14. `enableNewUI`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 15. `filterGroupedSuggestionsBy`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: [list]
  - **prisa**: [list]
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 16. `hasMultipleBusinessUnit`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 17. `hasTransferPaymentType`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 18. `hasTransportCode`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 19. `hasVoucherPrinterEnabled`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 20. `hidePrices`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 21. `lazyLoadingPrices`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 22. `ordersRequireAuthorization`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 23. `ordersRequireVerification`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 24. `packagingInformation.ignoreUnitOnPackInformationB2B`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 25. `payment.balances`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: [list]
  - **prisa**: [list]
  - **new**: [list]

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 26. `paymentsWithoutAccount`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 27. `pointsEnabled`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 28. `priceRoundingDecimals`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: 0
  - **prisa**: 0
  - **new**: 0

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 29. `shareOrderNewDesign`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 30. `synchronization.backgroundSyncList`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: [list]
  - **prisa**: [list]
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 31. `synchronization.enableBackgroundSendOrders`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 32. `synchronization.enableBackgroundSync`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 33. `synchronization.enableSyncImages`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 34. `taxes.taxRate`

**Status by Client**

  - **codelpa**: 0
  - **marleycoffee**: 0
  - **prisa**: 0
  - **new**: 0

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 35. `uploadOrderFileWithMinUnits`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 36. `validatePaymentFromAdmin`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 37. `weightInfo`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 38. `wrongPrices.block`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: —

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

#### 39. `wrongPrices.threshold`

**Status by Client**

  - **codelpa**: —
  - **marleycoffee**: —
  - **prisa**: —
  - **new**: 50

**Analysis**
- Not found in B2B codebase
- Not enabled in any staging client
- Candidate for deprecation/removal

---

## Recommendations


### Priority 1: Backend-Only Variables (35)
1. **Verify backend implementation**: Confirm these flags are returned by API
2. **Check frontend consumption**: Search for conditional logic that uses these flags
3. **Add integration tests**: Document expected behavior per client
4. **Update types**: Ensure TypeScript types are complete

**Action items**:
- Meet with backend team to understand feature flag strategy
- Implement proper type guards for API-provided features
- Document lazy consumption patterns

### Priority 2: Dead/Unused Variables (39)
1. **Determine ownership**: Who defined these? Why?
2. **Check commit history**: When were they last used?
3. **Plan deprecation**: If truly unused, schedule removal
4. **Communicate**: Notify stakeholders before cleanup

**Action items**:
- Create Jira/Linear ticket for each variable
- Set 2-sprint grace period for cleanup
- Document removal reason

### Long-term Strategy
1. Establish feature flag governance model
2. Link flags to epic/feature tracking system
3. Implement flag audit on release cycle
4. Create deprecation policy with timeline


---

## Data Files Referenced


- **Status baseline**: `/Users/lalojimenez/qa/data/b2b-feature-status.json`
- **Client config**: `/Users/lalojimenez/qa/data/qa-matrix-staging.json`
- **Source cache**: `/Users/lalojimenez/qa/data/.b2b-source-cache/src/`
