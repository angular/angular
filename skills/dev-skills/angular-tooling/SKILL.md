---
name: angular-tooling
description: Use Angular CLI and development tools effectively in Angular v20+ projects. Use for project setup, code generation, building, testing, and configuration. Triggers on creating new projects, generating components/services/modules, configuring builds, running tests, or optimizing production builds. Do not use for framework-level API guidance; use specific Angular skills instead.
license: MIT
metadata:
  author: Copyright 2026 Google LLC
  version: '1.0'
---

# Angular Tooling


Use Angular CLI and development tools for efficient Angular v20+ development.

## Project Setup

### Create New Project

First, create the project using the Angular CLI. Then, configure defaults in `angular.json`. Finally, generate features with `ng generate`.

```bash
# Create new standalone project (default in v20+)
ng new my-app

# With specific options
ng new my-app --style=scss --routing --ssr=false

# Skip tests
ng new my-app --skip-tests

# Minimal setup
ng new my-app --minimal --inline-style --inline-template
```

### Project Structure

```
my-app/
├── src/
│   ├── app/
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── public/                  # Static assets
├── angular.json             # CLI configuration
├── package.json
├── tsconfig.json
└── tsconfig.app.json
```

## Recommended Defaults

### Strict Mode

Enable strict TypeScript checking (default in new projects):

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### Default Schematics

Configure defaults in `angular.json`:

```json
{
  "schematics": {
    "@schematics/angular:component": {
      "changeDetection": "OnPush",
      "style": "scss",
      "skipTests": false
    },
    "@schematics/angular:service": {
      "skipTests": false
    }
  }
}
```

## Code Generation

### Components

```bash
# Generate component
ng generate component features/user-profile
ng g c features/user-profile  # Short form

# With options
ng g c shared/button --inline-template --inline-style
ng g c features/dashboard --skip-tests
ng g c features/settings --change-detection=OnPush

# Flat (no folder)
ng g c shared/icon --flat

# Dry run (preview)
ng g c features/checkout --dry-run
```

### Services

```bash
# Generate service (providedIn: 'root' by default)
ng g service services/auth
ng g s services/user

# Skip tests
ng g s services/api --skip-tests
```

### Other Schematics

```bash
# Directive
ng g directive directives/highlight
ng g d directives/tooltip

# Pipe
ng g pipe pipes/truncate
ng g p pipes/date-format

# Guard (functional by default)
ng g guard guards/auth

# Interceptor (functional by default)
ng g interceptor interceptors/auth

# Interface
ng g interface models/user

# Enum
ng g enum models/status

# Class
ng g class models/product
```

### Generate with Path Alias

```bash
# Components in feature folders
ng g c @features/products/product-list
ng g c @shared/ui/button
```

## Development Server

```bash
# Start dev server
ng serve
ng s  # Short form

# With options
ng serve --port 4201
ng serve --open  # Open browser
ng serve --host 0.0.0.0  # Expose to network

# Production mode locally
ng serve --configuration=production

# With SSL
ng serve --ssl --ssl-key ./ssl/key.pem --ssl-cert ./ssl/cert.pem
```

## Building

### Development Build

```bash
ng build
```

### Production Build

```bash
ng build --configuration=production
ng build -c production  # Short form

# With specific options
ng build -c production --source-map=false
ng build -c production --named-chunks
```

### Build Output

```
dist/my-app/
├── browser/
│   ├── index.html
│   ├── main-[hash].js
│   ├── polyfills-[hash].js
│   └── styles-[hash].css
└── server/              # If SSR enabled
    └── main.js
```

## Testing

### Unit Tests

```bash
# Run tests
ng test
ng t  # Short form

# Single run (CI)
ng test --watch=false --browsers=ChromeHeadless

# With coverage
ng test --code-coverage

# Specific file
ng test --include=**/user.service.spec.ts
```

### E2E Tests

```bash
# Run e2e (if configured)
ng e2e
```

## Linting

```bash
# Run linter
ng lint

# Fix auto-fixable issues
ng lint --fix
```

## ESLint Configuration

### Install Angular ESLint

```bash
ng add @angular-eslint/schematics
```

### Recommended Rules

```json
// .eslintrc.json
{
  "rules": {
    "@angular-eslint/prefer-on-push-component-change-detection": "error",
    "@angular-eslint/use-lifecycle-interface": "error",
    "@angular-eslint/no-host-metadata-property": "off",
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

Note: `no-host-metadata-property` should be OFF because we prefer `host` object over `@HostBinding`/`@HostListener`.

## Accessibility Tooling

### ESLint A11y Rules

```bash
npm install -D eslint-plugin-jsx-a11y @angular-eslint/template-parser
```

### Lighthouse CI

```bash
npm install -D @lhci/cli

# Run accessibility audit
npx lhci autorun --collect.settings.preset=desktop
```

## Configuration

### angular.json Key Sections

```json
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "outputPath": "dist/my-app",
            "index": "src/index.html",
            "browser": "src/main.ts",
            "polyfills": ["zone.js"],
            "tsConfig": "tsconfig.app.json",
            "assets": ["{ \"glob\": \"**/*\", \"input\": \"public\" }"],
            "styles": ["src/styles.scss"],
            "scripts": []
          },
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kB",
                  "maximumError": "1MB"
                }
              ],
              "outputHashing": "all"
            },
            "development": {
              "optimization": false,
              "extractLicenses": false,
              "sourceMap": true
            }
          }
        }
      }
    }
  }
}
```

### Environment Configuration

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.example.com',
};
```

Configure in angular.json:

```json
{
  "configurations": {
    "production": {
      "fileReplacements": [
        {
          "replace": "src/environments/environment.ts",
          "with": "src/environments/environment.prod.ts"
        }
      ]
    }
  }
}
```

## Adding Libraries

### Angular Libraries

```bash
# Add Angular Material
ng add @angular/material

# Add Angular PWA
ng add @angular/pwa

# Add Angular SSR
ng add @angular/ssr

# Add Angular Localize
ng add @angular/localize
```

### Third-Party Libraries

```bash
# Install and configure
npm install @ngrx/signals

# Some libraries have schematics
ng add @ngrx/store
```

## Update Angular

```bash
# Check for updates
ng update

# Update Angular core and CLI
ng update @angular/core @angular/cli

# Update all packages
ng update --all

# Force update (skip peer dependency checks)
ng update @angular/core @angular/cli --force
```

## Performance Analysis

```bash
# Build with stats
ng build -c production --stats-json

# Analyze bundle (install esbuild-visualizer)
npx esbuild-visualizer --metadata dist/my-app/browser/stats.json --open
```

## Caching

```bash
# Enable persistent build cache (default in v20+)
# Configured in angular.json:
{
  "cli": {
    "cache": {
      "enabled": true,
      "path": ".angular/cache",
      "environment": "all"
    }
  }
}

# Clear cache
rm -rf .angular/cache
```

## Tailwind CSS

Add Tailwind CSS v4 to an Angular project with `ng add tailwindcss`. Do NOT use Tailwind v3 patterns (`tailwind.config.js`, `@tailwind` directives).

See `references/tailwind-css.md` for automated setup, manual v4 configuration, and critical agent guidance.

## Angular CLI MCP Server

The Angular CLI includes an MCP server for AI assistant integration, providing tools for code generation, documentation search, and build/test execution.

See `references/mcp-server.md` for available tools, IDE configuration, and experimental tool flags.

See `references/tooling-patterns.md` for advanced configuration, custom builders, and deployment patterns.
