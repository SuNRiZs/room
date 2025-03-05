import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'moment/locale/ru';  // Чтобы moment показывал дни недели на русском

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
