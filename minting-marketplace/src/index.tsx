import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import {
  BrowserRouter,
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType
} from 'react-router-dom';
import { init, reactRouterV6Instrumentation } from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

import App from './App';
import store from './ducks';

import './index.css';

const sentryIoTraceRate = Number(process.env.REACT_APP_SENTRY_IO_TRACE_RATE);

if (process.env.REACT_APP_SENTRY_ENABLED) {
  init({
    release: process.env.REACT_APP_SENTRY_RELEASE,
    dsn: process.env.REACT_APP_SENTRY_IO_ENDPOINT,
    integrations: [
      new BrowserTracing({
        routingInstrumentation: reactRouterV6Instrumentation(
          useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        )
      })
    ],
    tracesSampleRate: Number.isNaN(sentryIoTraceRate)
      ? undefined
      : sentryIoTraceRate
  });
}

ReactDOM.render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </HelmetProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
