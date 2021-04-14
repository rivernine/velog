import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Routes from './Routes';
import * as serviceWorker from './serviceWorker';

import './config/lang/i18n'

import { createStore } from 'redux';
import { Provider } from 'react-redux';

import { persistStore, persistReducer } from 'redux-persist';
import storageSession from 'redux-persist/lib/storage/session'
import { PersistGate } from 'redux-persist/integration/react';

import rootReducer from './reducers/RootReducer'

const persistConfig = {
  key: 'root',
  storage: storageSession
};

const enhancedReducer = persistReducer(persistConfig, rootReducer)

const store = createStore(enhancedReducer)
const persistor = persistStore(store)

ReactDOM.render(
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <Routes />
    </PersistGate>
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
