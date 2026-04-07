# Angular Tooling Patterns

## Table of Contents
- [Custom Schematics](#custom-schematics)
- [Build Optimization](#build-optimization)
- [Multi-Project Workspace](#multi-project-workspace)
- [CI/CD Configuration](#cicd-configuration)
- [Path Aliases](#path-aliases)
- [Proxy Configuration](#proxy-configuration)

## Custom Schematics

### Generate Schematic Collection

```bash
# Install schematics CLI
npm install -g @angular-devkit/schematics-cli

# Create schematic collection
schematics blank --name=my-schematics
```

### Simple Component Schematic

```typescript
// src/my-component/index.ts
import { Rule, SchematicContext, Tree, apply, url, template, move, mergeWith } from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';

export function myComponent(options: { name: string; path: string }): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const templateSource = apply(url('./files'), [
      template({
        ...options,
        ...strings,
      }),
      move(options.path),
    ]);
    
    return mergeWith(templateSource)(tree, context);
  };
}
```

### Use Custom Schematics

```bash
# Link locally
npm link ./my-schematics

# Use
ng generate my-schematics:my-component --name=test --path=src/app
```

## Build Optimization

### Budget Configuration

```json
{
  "budgets": [
    {
      "type": "initial",
      "maximumWarning": "500kB",
      "maximumError": "1MB"
    },
    {
      "type": "anyComponentStyle",
      "maximumWarning": "4kB",
      "maximumError": "8kB"
    },
    {
      "type": "anyScript",
      "maximumWarning": "100kB",
      "maximumError": "200kB"
    }
  ]
}
```

### Differential Loading

Automatic in v20+ - builds for modern browsers by default.

```json
// .browserslistrc
last 2 Chrome versions
last 2 Firefox versions
last 2 Safari versions
last 2 Edge versions
```

### Code Splitting

```typescript
// Lazy load routes for automatic code splitting
export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes),
  },
  {
    path: 'reports',
    loadComponent: () => import('./reports/reports.component').then(m => m.Reports),
  },
];
```

### Tree Shaking

Ensure proper imports for tree shaking:

```typescript
// Good - tree shakeable
import { map, filter } from 'rxjs';

// Avoid - imports entire library
import * as rxjs from 'rxjs';
```

### Preload Strategy

```typescript
// app.config.ts
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
};
```

## Multi-Project Workspace

### Create Workspace

```bash
# Create empty workspace
ng new my-workspace --create-application=false

cd my-workspace

# Add applications
ng generate application main-app
ng generate application admin-app

# Add library
ng generate library shared-ui
ng generate library data-access
```

### Workspace Structure

```
my-workspace/
├── projects/
│   ├── main-app/
│   │   └── src/
│   ├── admin-app/
│   │   └── src/
│   ├── shared-ui/
│   │   └── src/
│   └── data-access/
│       └── src/
├── angular.json
└── package.json
```

### Build Specific Project

```bash
ng build main-app
ng build shared-ui
ng serve admin-app
```

### Library Configuration

```json
// projects/shared-ui/ng-package.json
{
  "$schema": "../../node_modules/ng-packagr/ng-package.schema.json",
  "dest": "../../dist/shared-ui",
  "lib": {
    "entryFile": "src/public-api.ts"
  }
}
```

### Using Library in App

```typescript
// After building library: ng build shared-ui
import { Button } from 'shared-ui';

@Component({
  imports: [Button],
  template: `<lib-button>Click</lib-button>`,
})
export class App {}
```

## CI/CD Configuration

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Test
        run: npm run test -- --watch=false --browsers=ChromeHeadless --code-coverage
      
      - name: Build
        run: npm run build -- -c production
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### GitLab CI

```yaml
# .gitlab-ci.yml
image: node:20

cache:
  paths:
    - node_modules/
    - .angular/cache/

stages:
  - install
  - test
  - build

install:
  stage: install
  script:
    - npm ci

test:
  stage: test
  script:
    - npm run lint
    - npm run test -- --watch=false --browsers=ChromeHeadless

build:
  stage: build
  script:
    - npm run build -- -c production
  artifacts:
    paths:
      - dist/
```

## Path Aliases

### Configure tsconfig.json

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@app/*": ["src/app/*"],
      "@env/*": ["src/environments/*"],
      "@shared/*": ["src/app/shared/*"],
      "@features/*": ["src/app/features/*"],
      "@core/*": ["src/app/core/*"]
    }
  }
}
```

### Usage

```typescript
// Instead of relative imports
import { User } from '../../../core/services/user.service';

// Use path alias
import { User } from '@core/services/user.service';
```

## Proxy Configuration

### Development Proxy

```json
// proxy.conf.json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true
  },
  "/auth": {
    "target": "http://localhost:4000",
    "secure": false,
    "pathRewrite": {
      "^/auth": ""
    }
  }
}
```

### Configure in angular.json

```json
{
  "serve": {
    "options": {
      "proxyConfig": "proxy.conf.json"
    }
  }
}
```

### Or via CLI

```bash
ng serve --proxy-config proxy.conf.json
```

## Custom Builders

### Using esbuild (Default in v20+)

```json
{
  "architect": {
    "build": {
      "builder": "@angular-devkit/build-angular:application",
      "options": {
        "browser": "src/main.ts"
      }
    }
  }
}
```

### SSR Configuration

```bash
# Add SSR
ng add @angular/ssr
```

```json
{
  "architect": {
    "build": {
      "options": {
        "server": "src/main.server.ts",
        "prerender": true,
        "ssr": {
          "entry": "server.ts"
        }
      }
    }
  }
}
```

## Debugging

### Source Maps

```json
{
  "configurations": {
    "development": {
      "sourceMap": true
    },
    "production": {
      "sourceMap": {
        "scripts": true,
        "styles": false,
        "hidden": true,
        "vendor": false
      }
    }
  }
}
```

### Verbose Logging

```bash
ng build --verbose
ng serve --verbose
```

### Debug Tests

```bash
# Run tests with debugging
ng test --browsers=Chrome

# In Chrome DevTools, open Sources tab and set breakpoints
```

## Package Scripts

```json
{
  "scripts": {
    "start": "ng serve",
    "build": "ng build",
    "build:prod": "ng build -c production",
    "test": "ng test",
    "test:ci": "ng test --watch=false --browsers=ChromeHeadless --code-coverage",
    "lint": "ng lint",
    "lint:fix": "ng lint --fix",
    "analyze": "ng build -c production --stats-json && npx esbuild-visualizer --metadata dist/my-app/browser/stats.json --open",
    "update": "ng update"
  }
}
```
