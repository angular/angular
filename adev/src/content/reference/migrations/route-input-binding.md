# Migration to route input binding

When component input binding is enabled with `withComponentInputBinding()`, the router sets route information such as path and query parameters as inputs of routed components. This schematic replaces reads of path and query parameters from an injected `ActivatedRoute` snapshot with signal inputs.

Run the schematic using the following command:

```shell
ng generate @angular/core:route-input-binding
```

IMPORTANT: The migration only runs if component input binding is already enabled for every router setup in your application. Enabling it sets inputs of all routed components that don't match any route information to `undefined`, so review routed components with default input values before enabling it.

#### Before

```typescript {header: "app.config.ts"}
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes, withComponentInputBinding())],
};
```

```typescript {header: "user.ts"}
import {Component, inject} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({/* ... */})
export class User {
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.loadUser(this.route.snapshot.paramMap.get('id'));
  }
}
```

#### After

```typescript {header: "user.ts"}
import {Component, input} from '@angular/core';

@Component({/* ... */})
export class User {
  readonly id = input.required<string>();

  ngOnInit() {
    this.loadUser(this.id());
  }
}
```

## Configuration options

### `path`

By default, the migration updates the whole Angular CLI workspace. You can limit the migration to a specific sub-directory using this option.

### `analysisDir`

In large projects you may use this option to reduce the amount of files being analyzed. By default, the migration analyzes the whole workspace, regardless of the `path` option, to find route definitions and router setups.

## How does it work?

The migration looks for components that inject `ActivatedRoute` and read path or query parameters from its snapshot, for example `route.snapshot.paramMap.get('id')` or `route.snapshot.queryParams['q']`. A read is replaced with an input only if the value is guaranteed to be the same:

- The component is rendered directly by a route, via `component` or `loadComponent`, and isn't extended by another class.
- A path parameter is replaced with a required input if every route that renders the component declares it in its path. Otherwise, it's only replaced if query parameters aren't bound, because a query parameter with the same name would be bound to the input instead.
- A query parameter is replaced with an optional input, if query parameters are bound and no route declares a path parameter with the same name.
- No route declares `data` or `resolve` keys with the same name. Route data takes precedence over parameters when binding inputs. Routes with `resources` are skipped, since their keys can't be determined.
- The read happens in a method, where inputs are already set. Reads in the constructor, in field initializers, or in methods called from them are not migrated.

If all usages of the `ActivatedRoute` are migrated and it's a private member, the injection is removed. Otherwise, it's kept, for example when it's used for relative navigation.

## Limitations

- Reads of the observables `paramMap`, `queryParamMap`, `params` and `queryParams` aren't migrated.
- Reads of route `data` aren't migrated.
- Components that are also rendered in the templates of other standalone components are skipped, because route information isn't bound to their inputs there. Components declared in NgModules can't be detected this way, so review them.
- If a query parameter is repeated in the URL, e.g. `?tag=a&tag=b`, the input receives all values, while `queryParamMap.get` returns only the first one.
- Unit tests that provide a mocked `ActivatedRoute` to migrated components need to set the inputs instead, for example via `RouterTestingHarness` or `fixture.componentRef.setInput`.
