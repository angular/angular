# Authentication with SSR

## Cookie-Based Auth

```typescript
// Server-side cookie reading
import { REQUEST } from '@angular/ssr/tokens';

@Injectable({ providedIn: 'root' })
export class Auth {
  #request = inject(REQUEST, { optional: true });
  #platformId = inject(PLATFORM_ID);

  getToken(): string | null {
    if (isPlatformServer(this.#platformId) && this.#request) {
      // Read from request cookies on server
      const cookies = this.#request.headers.cookie || '';
      const match = cookies.match(/auth_token=([^;]+)/);
      return match ? match[1] : null;
    }
    
    if (isPlatformBrowser(this.#platformId)) {
      // Read from document cookies on client
      const match = document.cookie.match(/auth_token=([^;]+)/);
      return match ? match[1] : null;
    }

    return null;
  }
}
```

## Skip SSR for Authenticated Routes

```typescript
// app.routes.server.ts
export const serverRoutes: ServerRoute[] = [
    // Public routes - prerender
    {path: '', renderMode: RenderMode.Prerender},
    {path: 'products', renderMode: RenderMode.Prerender},

    // Authenticated routes - client only
    {path: 'dashboard', renderMode: RenderMode.Client},
    {path: 'profile', renderMode: RenderMode.Client},
    {path: 'settings', renderMode: RenderMode.Client},

    // Server-side routes - // Dynamic product page → server-side rendered
    {path: 'product/:id', renderMode: RenderMode.Server }
];
```
