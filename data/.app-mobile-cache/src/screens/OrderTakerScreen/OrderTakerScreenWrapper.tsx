import React from 'react';
import { JavaRealmProvider } from '../../contexts/JavaRealmContext';
import OrderTakerScreen, { OrderTakerScreenProps } from './OrderTakerScreen';

type WrapperProps = Partial<OrderTakerScreenProps>;

const DEFAULT_COMMERCE_ID = '63d585270272a6aa946375b7';

const OrderTakerScreenWrapper: React.FC<WrapperProps> = (props) => {
  const commerceId = props.commerceId || DEFAULT_COMMERCE_ID;

  return (
    <JavaRealmProvider>
      <OrderTakerScreen {...props} commerceId={commerceId} />
    </JavaRealmProvider>
  );
};

export default OrderTakerScreenWrapper;

