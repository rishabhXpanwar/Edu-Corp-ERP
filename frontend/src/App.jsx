import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './store/store.js';
import AppRouter from './router/AppRouter.jsx';
import './styles/global.css';

const App = () => (
  <Provider store={store}>
    <AppRouter />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          fontFamily: 'var(--font-family)',
          fontSize: 'var(--font-size-sm)',
        },
        success: { iconTheme: { primary: 'var(--success)', secondary: '#fff' } },
        error:   { iconTheme: { primary: 'var(--danger)',  secondary: '#fff' } },
      }}
    />
  </Provider>
);

export default App;