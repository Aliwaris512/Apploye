import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

// Mock store creator for testing
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: (state = initialState, action) => {
      // Add your reducers here if needed
      return state;
    },
    preloadedState: initialState,
  });
};

// Custom render function that includes providers
const customRender = (
  ui,
  {
    initialState = {},
    store = createMockStore(initialState),
    route = '/',
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={[route]}>
          {children}
        </MemoryRouter>
      </ThemeProvider>
    </Provider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Re-export everything
export * from '@testing-library/react';
// Override render method
export { customRender as render };
