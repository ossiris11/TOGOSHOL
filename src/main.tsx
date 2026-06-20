import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { ProductsProvider } from './hooks/useProducts';
import './styles/variables.css';
import './styles/globals.css';
import './styles/utilities.css';
import './styles/responsive.css';
import './styles/animations.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProductsProvider>
      <App />
    </ProductsProvider>
  </StrictMode>,
);
