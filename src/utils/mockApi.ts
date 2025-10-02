// Mock API interceptor to handle external requests
// This prevents 404 errors from browser extensions or dev tools

const originalFetch = window.fetch;

window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input.toString();
  
  // Intercept requests to JSONBin
  if (url.includes('api.jsonbin.io')) {
    console.log('Intercepted request to JSONBin, using mock data');
    return Promise.resolve(new Response(JSON.stringify({
      record: {
        customers: [],
        orders: [],
        services: [],
        employees: [],
        inventoryItems: [],
        invoices: [],
        clientAccess: [],
        servicePacks: [],
        clientOrders: [],
        lastUpdated: new Date().toISOString()
      }
    }), {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'application/json' }
    }));
  }
  
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
