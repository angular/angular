# Development server proxy configuration

When developing an Angular application locally (using `ng serve`), you will often need to communicate with backend APIs. If your backend is hosted on a different domain or port and does not send CORS headers that allow the dev server origin (e.g., `http://localhost:4200`), the browser will block the requests due to **CORS (Cross-Origin Resource Sharing)** restrictions.

Angular provides a built-in development proxy to avoid these restrictions by routing requests through the local development server, so the browser only ever talks to the same origin.

> **Note:** This guide describes the behavior of the Vite-based development server (`@angular/build:dev-server`), used by the `application` builder. It applies only to local development and does not affect production builds.
>
> Projects still using the webpack-based `browser` builder (`@angular-devkit/build-angular:dev-server`) also support `proxyConfig`, but the file is handed to webpack-dev-server, whose path matching rules and supported options differ from what is described here.
>
> To apply changes made to your proxy configuration file, you must restart the `ng serve` process.

---

## 1. Basic proxy configuration (`proxy.conf.json`)

To proxy requests to a local or external backend, create a `proxy.conf.json` file in your `src/` folder (or at the root of your project).

```json
{
  "/api/**": {
    "target": "http://localhost:3000"
  }
}
```

- **`target`**: The backend server URL.
- **`secure`**: Defaults to `true`. Set it to `false` only when a **local** backend uses a self-signed certificate (e.g., `https://localhost:3000`), since it disables TLS certificate validation.

### Path matching behavior

Each key is matched against the request path, including its query string:

- A plain path such as `"/api"` is a **prefix match**. It matches `/api`, `/api/users/123`, but also `/api-docs` or `/apiary.png`. Prefer `"/api/"` or a glob if other routes share the same prefix.
- A key containing glob characters is converted to a regular expression that must match the whole path:
  - `"/api/*"` matches `/api/users` but not `/api` or `/api/users/123`.
  - `"/api/**"` matches `/api`, `/api/users` and `/api/users/123` (recommended for API subpaths).
  - Globs do not match path segments starting with a dot, such as `/api/.well-known/openid-configuration`. Use a prefix key or a regular expression for those.
- A key starting with `^` is used as a regular expression as-is (e.g., `"^/api/v[0-9]+/"`).

### Enabling the proxy

Update your `angular.json` to point the `serve` target to your proxy file:

```json
"serve": {
  "builder": "@angular/build:dev-server",
  "options": {
    "proxyConfig": "src/proxy.conf.json"
  }
}
```

Alternatively, pass the proxy file directly on the command line:

```bash
ng serve --proxy-config src/proxy.conf.json
```

---

## 2. Advanced proxy settings

For more complex scenarios, you can add options to change the origin, rewrite paths, or enable WebSockets.

```json
{
  "/api/**": {
    "target": "https://api.external-staging.com",
    "changeOrigin": true,
    "pathRewrite": {
      "^/api": ""
    }
  },
  "/ws/**": {
    "target": "ws://localhost:3000",
    "ws": true
  }
}
```

### Key options explained:

- **`changeOrigin: true`**: **Crucial** when proxying to an external or cloud-hosted server (not localhost). It changes the `Host` header of the request to match the target's domain, avoiding Name-Based Virtual Hosting rejections.
- **`pathRewrite`**: Modifies the URL path before sending it to the backend. Each key is a regular expression and the first one that changes the path wins. In the example above, `http://localhost:4200/api/users` becomes `https://api.external-staging.com/users`.
- **`ws: true`**: Enables proxying for WebSocket connections.

### Debugging the proxy

The `logLevel` option from webpack-dev-server has no effect with the Vite-based dev server. To see how requests are matched, bypassed and forwarded, enable Vite's proxy debug output:

```bash
DEBUG=vite:proxy ng serve
```

---

## 3. Dynamic configuration (`proxy.conf.mjs`)

If you need conditional logic, environment variables, or custom logic (e.g., bypassing the proxy to return mock data), use a JavaScript configuration file.

1. Create `proxy.conf.mjs`. Use the `.mjs` extension for ES module syntax (`export default`), or `proxy.conf.js` with `module.exports` if your `package.json` does not declare `"type": "module"`.
2. Update `angular.json` (or the `--proxy-config` flag) to point to `src/proxy.conf.mjs`.

```javascript
const PROXY_CONFIG = [
  {
    context: ['/api', '/auth'],
    target: process.env.BACKEND_URL ?? 'http://localhost:3000',
    changeOrigin: true,
    // Custom logic to bypass the proxy
    bypass: (req, res) => {
      // Example: Serve a mock file (placed in `public/`) if a specific header is present
      if (req.headers['x-mock-request']) {
        return '/mock-response.json';
      }

      // Example: Skip proxy for HTML document requests
      if (req.headers.accept?.includes('text/html')) {
        return '/index.html';
      }
    },
  },
];

export default PROXY_CONFIG;
```

### The `bypass` function

- Returning a **string** skips the proxy and rewrites the request URL to that path, which is then served by the dev server itself. The file must exist in a folder the dev server serves, such as `public/`, otherwise you will typically get `index.html` or a `404` instead of the mock.
- Returning **`false`** responds with a `404`.
- Returning nothing forwards the request to the `target` as usual.

### Multiple entries with `context`

In the JS format, you can define an array of configurations. The `context` property lets you match multiple paths (e.g., `['/api', '/auth']`) to the same target without duplicating the configuration block.

`context` must be an **array of strings**, even for a single path. An entry without `context`, or with a plain string such as `context: '/api'`, is silently ignored and nothing gets proxied.
