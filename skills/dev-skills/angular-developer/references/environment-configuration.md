# Environment configuration

## Configuration strategies

Angular supports two main configuration strategies:

- **Build-time configuration** using environment files
- **Runtime configuration** by loading values at application startup

Choose the approach based on your deployment requirements.

---

## Build-time configuration

Environment files define configuration values that are replaced at build time.

Generate environment files using the CLI:

```bash
ng generate environments
```

This creates environment-specific files such as:

```ts
// environment.ts (production)
export const environment = {
  production: true,
  apiUrl: 'https://api.example.com',
};
```

```ts
// environment.development.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
};
```

Import the environment where needed:

```ts
import {environment} from '../environments/environment';

const apiUrl = environment.apiUrl;
```

The Angular CLI replaces the appropriate file based on the build configuration.

> Changes to environment files require rebuilding the application.

---

## Runtime configuration (advanced)

In some scenarios, applications need to load configuration at runtime instead of build time.

This allows the same build artifact to be deployed across multiple environments without rebuilding.

A common approach is to load a JSON configuration file from the `assets` folder during application initialization.

### Example

```json
// src/assets/config.json
{
  "apiUrl": "https://api.example.com"
}
```

Load the configuration before the application starts:

```ts
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';

@Injectable({providedIn: 'root'})
export class AppConfigService {
  private config!: {apiUrl: string};

  constructor(private http: HttpClient) {}

  loadConfig(): Promise<void> {
    return firstValueFrom(this.http.get<{apiUrl: string}>('/assets/config.json')).then((cfg) => {
      this.config = cfg;
    });
  }

  get apiUrl(): string {
    return this.config.apiUrl;
  }
}
```

Register the loader during application bootstrap:

```ts
import {provideAppInitializer, inject} from '@angular/core';

provideAppInitializer(() => {
  const config = inject(AppConfigService);
  return config.loadConfig();
});
```

This ensures configuration is available before the application renders.

> Runtime configuration is an advanced pattern and is not required for most applications.

---

## Choosing a strategy

| Criteria               | Build-time | Runtime      |
| ---------------------- | ---------- | ------------ |
| Change without rebuild | No         | Yes          |
| Startup performance    | Faster     | Slight delay |
| Complexity             | Low        | Moderate     |
| Deployment flexibility | Limited    | High         |

Use build-time configuration for most applications, and runtime configuration when you need to deploy the same build across multiple environments.
