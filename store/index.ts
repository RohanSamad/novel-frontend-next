import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import novelsReducer from './slices/novelsSlice';
import chaptersReducer from './slices/chaptersSlice';
import progressReducer from './slices/progressSlice';
import featuredReducer from './slices/featuredSlice';
import themeReducer from './slices/themeSlice';
import usersReducer from './slices/usersSlice';
import authorsReducer from './slices/authorsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    novels: novelsReducer,
    chapters: chaptersReducer,
    progress: progressReducer,
    featured: featuredReducer,
    theme: themeReducer,
    users: usersReducer,
    authors: authorsReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false,
    }),
     devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;