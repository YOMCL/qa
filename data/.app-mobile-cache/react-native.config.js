module.exports = {
  dependencies: {
    // Disable React Native Realm autolinking - we use Java Realm only
    realm: {
      platforms: {
        android: null,
        ios: null,
      },
    },
  },
};
