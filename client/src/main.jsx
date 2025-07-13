// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'
// import { BrowserRouter } from 'react-router-dom'
// import { ClerkProvider } from '@clerk/clerk-react'
// import { AppProvider } from './context/AppContext.jsx'

// const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// if (!PUBLISHABLE_KEY) {
//   throw new Error('Missing Publishable Key')
// }

// createRoot(document.getElementById('root')).render(
//   <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
//   <BrowserRouter>
//   <AppProvider>
//     <App />
//   </AppProvider>
//   </BrowserRouter>
//   </ClerkProvider>,
// )

// main.jsx
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { AppProvider } from './context/AppContext.jsx';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key');
}

// Wrap ClerkProvider with navigation logic
const ClerkWithRouter = () => {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      navigate={(to) => navigate(to)}
      userProfile={{
        additionalNavigation: [
          {
            label: 'My Bookings',
            icon: 'ticket',
            to: '/my-bookings',
          },
        ],
      }}
    >
      <AppProvider>
        <App />
      </AppProvider>
    </ClerkProvider>
  );
};

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ClerkWithRouter />
  </BrowserRouter>
);
