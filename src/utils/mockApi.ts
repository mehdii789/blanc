// Mock API interceptor to handle external requests
// This prevents 404 errors from browser extensions or dev tools

const originalFetch = window.fetch;

window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input.toString();
  
  // Intercept requests to /invoices endpoint
  if (url.includes('/invoices') && !url.includes('http')) {
    return Promise.resolve(new Response(JSON.stringify([]), {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'application/json' }
    }));
  }
  
  // Pass through all other requests
  return originalFetch.call(this, input, init);
};

export {}; // Make this a module
