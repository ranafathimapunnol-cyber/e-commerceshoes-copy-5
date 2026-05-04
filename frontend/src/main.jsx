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
                duration: 3000,
                style: {
                    background: '#000',
                    color: '#fff',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    fontSize: '14px',
                },
            }}
        />
    </Provider>,
);
