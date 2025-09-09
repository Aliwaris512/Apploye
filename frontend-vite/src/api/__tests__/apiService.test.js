import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { API_BASE_URL } from '../apiEndpoints';
import { authAPI, projectsAPI } from '../apiService';

// Mock server setup
const server = setupServer(
  // Mock login endpoint
  rest.post(`${API_BASE_URL}/auth/login`, (req, res, ctx) => {
    const { username, password } = req.body;
    
    if (username === 'test@example.com' && password === 'password123') {
      return res(
        ctx.status(200),
        ctx.json({
          access_token: 'mock-jwt-token',
          token_type: 'bearer',
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
          },
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({ detail: 'Incorrect email or password' })
    );
  }),
  
  // Mock projects endpoint
  rest.get(`${API_BASE_URL}/projects`, (req, res, ctx) => {
    // Check for auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({ detail: 'Not authenticated' })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json([
        { id: '1', name: 'Project 1' },
        { id: '2', name: 'Project 2' },
      ])
    );
  })
);

// Enable API mocking before tests
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests
afterEach(() => {
  server.resetHandlers();
  // Clear local storage
  localStorage.clear();
});

// Clean up after the tests are finished
afterAll(() => server.close());

describe('authAPI', () => {
  it('successfully logs in with valid credentials', async () => {
    const credentials = {
      username: 'test@example.com',
      password: 'password123',
    };
    
    const response = await authAPI.login(credentials);
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('access_token');
    expect(response.data.user.email).toBe(credentials.username);
  });
  
  it('fails to log in with invalid credentials', async () => {
    const credentials = {
      username: 'wrong@example.com',
      password: 'wrongpassword',
    };
    
    await expect(authAPI.login(credentials)).rejects.toThrow('Request failed with status code 401');
  });
});

describe('projectsAPI', () => {
  it('fetches projects successfully when authenticated', async () => {
    // First, log in to get a token
    await authAPI.login({
      username: 'test@example.com',
      password: 'password123',
    });
    
    // Now fetch projects
    const response = await projectsAPI.getAll();
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
  });
  
  it('fails to fetch projects when not authenticated', async () => {
    await expect(projectsAPI.getAll()).rejects.toThrow('Request failed with status code 401');
  });
});
