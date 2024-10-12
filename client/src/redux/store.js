import { combineReducers, configureStore } from '@reduxjs/toolkit';
import userReducer from './user/userSlice'; 
import { persistReducer } from 'redux-persist'; 
import storage from 'redux-persist/lib/storage'; 
import persistStore from 'redux-persist/es/persistStore'; 

// Combine multiple reducers (in this case, only userReducer)
const rootReducer = combineReducers({
  user: userReducer, // You can add more reducers here if needed
});

// Configuration for persisting the reducer
const persistConfig = {
  key: 'root', // Key to store persisted state
  storage,     // Storage engine (localStorage)
  version: 1,  // Versioning for backward compatibility
};

// Apply the persistReducer wrapper to the root reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the Redux store with persisted reducer and middleware
export const store = configureStore({
  reducer: persistedReducer, // Use the persisted version of the root reducer
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializability checks for non-serializable values (e.g., functions, promises)
    }),
});

// Create a persistor instance to persist and rehydrate the store
export const persistor = persistStore(store);
