// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <App />
        <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
                duration: 5000,
                style: {
                    background: 'black',
                    color: 'white',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    border: '1px solid #333',
                },
            }}
        />
    </Provider>,
);
