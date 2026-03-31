/**
 * Client configurations for multi-client tests.
 * Credentials are read from environment variables — never hardcode them here.
 *
 * Required env vars per client: {KEY}_EMAIL, {KEY}_PASSWORD
 * Example: TIENDA_EMAIL=user@yom.ai, TIENDA_PASSWORD=secret
 */

interface ClientConfig {
  name: string;
  baseURL: string;
  loginPath: string;
  credentials: { email: string; password: string };
  config: Record<string, any>;
}

function creds(prefix: string) {
  return {
    email: process.env[`${prefix}_EMAIL`] || '',
    password: process.env[`${prefix}_PASSWORD`] || '',
  };
}

const clients: Record<string, ClientConfig> = {
  tienda: {
    name: 'Tienda',
    baseURL: 'https://tienda.youorder.me',
    loginPath: '/auth/jwt/login',
    credentials: creds('TIENDA'),
    config: {
      anonymousAccess: true,
      enableCoupons: true,
      enableOrderApproval: true,
      purchaseOrderEnabled: true,
      editAddress: true,
      hideReceiptType: false,
      disableCart: false,
      hidePrices: false,
      currency: 'clp',
    },
  },
  soprole: {
    name: 'Soprole',
    baseURL: 'https://soprole.solopide.me',
    loginPath: '/login',
    credentials: creds('SOPROLE'),
    config: {
      anonymousAccess: false,
      enableCoupons: true,
      enablePriceOracle: true,
      enableOrderApproval: false,
      ordersRequireAuthorization: true,
      hidePrices: false,
      disableCart: false,
      enablePayments: true,
      useMongoPricing: true,
      currency: 'clp',
    },
  },
  surtiventas: {
    name: 'Surtiventas',
    baseURL: 'https://surtiventas.solopide.me',
    loginPath: '/auth/jwt/login',
    credentials: creds('SURTIVENTAS'),
    config: {
      anonymousAccess: false,
      enableCoupons: true,
      enableChooseSaleUnit: true,
      limitAddingByStock: true,
      useNewPromotions: true,
      includeTaxRateInPrices: true,
      hidePrices: false,
      disableCart: false,
      currency: 'cop',
    },
  },
  marleycoffee: {
    name: 'Marley Coffee',
    baseURL: 'https://marleycoffee.solopide.me',
    loginPath: '/auth/jwt/login',
    credentials: creds('MARLEYCOFFEE'),
    config: {
      anonymousAccess: false,
      enableCoupons: true,
      hidePrices: false,
      disableCart: false,
      currency: 'clp',
    },
  },
  codelpa: {
    name: 'Codelpa',
    baseURL: 'https://beta-codelpa.solopide.me',
    loginPath: '/login',
    credentials: creds('CODELPA'),
    config: {
      // Login & auth
      anonymousAccess: false,
      anonymousHideCart: true,
      anonymousHidePrice: true,

      // Commerce management
      disableCommerceEdit: true,
      editAddress: false,

      // Coupons & promotions
      enableCoupons: true,

      // Orders & checkout
      enableMassiveOrderSend: true,
      enableOrderApproval: true,
      enableOrderValidation: true,
      enableSellerDiscount: true,
      hideReceiptType: true,
      purchaseOrderEnabled: true,
      disableCart: false,
      hidePrices: false,

      // App features (vendedor)
      enableTask: true,

      // Stock & distribution
      hasAllDistributionCenters: true,
      hasStockEnabled: true,

      // User interface
      pendingDocuments: true,
      useMobileGps: true,

      // Pricing & data sync
      useMongoPricing: true,
      "taxes.showSummary": true,
      "shoppingDetail.lastOrder": true,
      "synchronization.enableSyncImages": true,
      "packagingInformation.hideSingleItemPackagingInformationB2B": true,

      // Integration hooks
      "hooks.shippingHook": true,
      "hooks.stockHook": true,

      // Currency
      currency: 'clp',
    },
  },
};

export default clients;
