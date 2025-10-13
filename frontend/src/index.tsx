import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

import './styles/colors.css';        
import './styles/global.css';       
import './styles/form-styles.css';   

// 3️⃣ App principal
import App from './App';
import reportWebVitals from './reportWebVitals';

// 4️⃣ Renderizado
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 5️⃣ Métricas opcionales
reportWebVitals();
