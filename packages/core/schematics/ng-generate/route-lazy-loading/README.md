# Route lazy loading migration
This schematic helps developers to convert eagerly loaded component routes to lazy loaded routes.
By lazy loading components we can split the production bundle into smaller chunks,
to avoid big JS bundle that includes all routes, which negatively affects initial page load of an application.

## How to run this migration?
The migration can be run using the following command:

```bash
ng generate @angular/core:route-lazy-loading
```

By default, migration will go over the entire application. If you want to apply this migration to a subset of the files, you can pass the path argument as shown below:

```bash
ng generate @angular/core:route-lazy-loading --path src/app/sub-component
```

The value of the path parameter is a relative path within the project.

### How does it work?
The schematic will attempt to find all the places where the application routes as defined:
- `RouterModule.forRoot` and `RouterModule.forChild`
- `Router.resetConfig`
- `provideRouter`
- `provideRoutes`
- variables of type `Routes` or `Route[]` (e.g. `const routes: Routes = [{...}]`)

The migration will check all the components in the routes, check if they are standalone and eagerly loaded, and if so, it will convert them to lazy loaded routes.

**Before:**
```typescript
// app.module.ts
import { HomeComponent } from './home/home.component';

@NgModule({
  imports: [
    RouterModule.forRoot([
      {
        path: 'home',
        component: HomeComponent, // HomeComponent is standalone and eagerly loaded
      },
    ]),
  ],
})
export class AppModule {}
```
**After:**
```typescript
// app.module.ts
@NgModule({
  imports: [
    RouterModule.forRoot([
      {
        path: 'home',
        // ↓ HomeComponent is now lazy loaded
        loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
      },
    ]),
  ],
})
export class AppModule {}
```

> This migration will also collect information about all the components declared in NgModules
and output the list of routes that use them (including corresponding location of the file).
Consider making those components standalone and run this migration again.
You can use an existing migration (see https://angular.dev/reference/migrations/standalone)
to convert those components to standalone.