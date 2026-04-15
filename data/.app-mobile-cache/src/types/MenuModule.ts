export interface MenuModule {
  openMainMenu(): void;
  navigateToCommerceList(): void;
  navigateToOrderList(): void;
  navigateToCollectionPayments(): void;
}

declare module 'react-native' {
  interface NativeModulesStatic {
    MenuModule: MenuModule;
  }
} 