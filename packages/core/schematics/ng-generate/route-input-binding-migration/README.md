## Route input binding migration

Replaces reads of path and query parameters from an injected `ActivatedRoute` snapshot with signal
inputs, in applications that bind route information to component inputs via
`withComponentInputBinding()` or `bindToComponentInputs: true`.

#### Before

```ts
import {Component, inject} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({template: ''})
export class User {
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.loadUser(this.route.snapshot.paramMap.get('id'));
  }
}
```

#### After

```ts
import {Component, input} from '@angular/core';

@Component({template: ''})
export class User {
  readonly id = input.required<string>();

  ngOnInit() {
    this.loadUser(this.id());
  }
}
```

### How it works

The migration is split into the usual Tsurge stages:

- **Analyze** (per compilation unit): records the router setups (`provideRouter` and
  `RouterModule.forRoot`, ignoring test files), the routes rendering each component, components
  imported by other components, and the `ActivatedRoute` snapshot reads of each component.
- **Global metadata**: decides which reads can be migrated. Nothing is migrated unless every router
  setup binds inputs, since enabling input binding affects every routed component. A read is only
  approved if the bound input is guaranteed to have the same value as the snapshot:
  - path params need to be declared in the path of every route rendering the component, unless
    query params aren't bound. Otherwise a query param with the same name could be bound instead.
  - query params must not collide with path params of any route.
  - no key may collide with route `data` or `resolve` keys, since data takes precedence. Routes
    with `resources` are skipped, since their keys can't be determined.
  - the component must not be imported by other components or extended by other classes.
- **Migrate** (per compilation unit): re-analyzes approved components, adds the inputs, replaces the
  reads and removes the `ActivatedRoute` member if it's private and has no other usages.

Reads in the constructor, field initializers, or methods reachable from them are never migrated,
because inputs of routed components are only set after the component is created.
