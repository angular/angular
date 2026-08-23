# Development Server Proxy Configuration

When developing an Angular application locally (using `ng serve`), you will often need to communicate with backend APIs. If your backend is hosted on a different domain or port, your browser will block the requests due to **CORS (Cross-Origin Resource Sharing)** restrictions.

Angular provides a built-in development proxy to bypass these restrictions by routing requests through the local development server.

> **Note:** Proxy configuration is for Vite-based development servers (`@angular/build:dev-server` with `ng serve`). It applies only to local development and does not affect production builds.

---

## 1. Basic Proxy Configuration (`proxy.conf.json`)

To proxy requests to a local or external backend, create a `proxy.conf.json` file in your `src/` folder (or at the root of your project).

```json
{
  "/api/**": {
    "target": "http://localhost:3000",
    "secure": false
  }
}
```

- **`target`**: The backend server URL.
- **`secure`**: Set to `false` if the backend uses a self-signed SSL certificate (e.g., `https://localhost:3000`).

### Enabling the Proxy

Update your `angular.json` to point the `serve` target to your proxy file:

```json
"serve": {
  "builder": "@angular/build:dev-server",
  "options": {
    "proxyConfig": "src/proxy.conf.json"
  }
}
```

---

## 2. Advanced Proxy Settings

For more complex scenarios, you can add options to handle CORS, rewrite paths, or enable WebSockets.

```json
{
  "/api/**": {
    "target": "https://api.external-staging.com",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/api": ""
    },
    "logLevel": "debug"
  },
  "/ws/**": {
    "target": "ws://localhost:3000",
    "ws": true
  }
}
```

### Key Options Explained:

- **`changeOrigin: true`**: **Crucial** when proxying to an external or cloud-hosted server (not localhost). It changes the `Host` header of the request to match the target's domain, avoiding Name-Based Virtual Hosting rejections.
- **`pathRewrite`**: Modifies the URL path before sending it to the backend. In the example above, `http://localhost:4200/api/users` becomes `https://api.external-staging.com/users`.
- **`logLevel: "debug"`**: Very useful for troubleshooting. It prints exactly how the proxy rewrites and routes your requests in the terminal running `ng serve`.
- **`ws: true`**: Enables proxying for WebSocket connections.

---

## 3. Dynamic Configuration (`proxy.conf.js`)

If you need conditional logic, environment variables, or custom middleware (e.g., bypassing the proxy to return mock data), use a JavaScript configuration file.

1. Create `proxy.conf.js` (or `.mjs`):
2. Update `angular.json` to point to `src/proxy.conf.js`.

```javascript
const PROXY_CONFIG = [
  {
    context: ['/api'],
    target: process.env.BACKEND_URL ?? 'http://localhost:3000',
    secure: false,
    changeOrigin: true,
    // Custom logic to bypass the proxy
    bypass: (req, res) => {
      // Example: Return mock data file if a specific header is present
      if (req.headers['x-mock-request']) {
        return '/assets/mock-response.json';
      }

      // Example: Skip proxy for HTML requests
      if (req.headers.accept?.includes('text/html')) {
        return '/index.html';
      }
    },
  },
];

export default PROXY_CONFIG;
```

### Multiple Entries with `context`

In the JS format, you can define an array of configurations. The `context` property allows you to match multiple paths (e.g., `['/api', '/auth']`) to the same target without duplicating the configuration block.
