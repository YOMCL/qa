import { registerRootComponent } from 'expo';
import { AppRegistry } from 'react-native';
import App from './src/App';
import OrderTakerScreenWrapper from './src/screens/OrderTakerScreen/OrderTakerScreenWrapper';
import TransportCodeScreen from './src/screens/TransportCodeScreen';

registerRootComponent(App);

AppRegistry.registerComponent('TransportCodeActivity', () => TransportCodeScreen);
AppRegistry.registerComponent('OrderTakerActivity', () => OrderTakerScreenWrapper);
