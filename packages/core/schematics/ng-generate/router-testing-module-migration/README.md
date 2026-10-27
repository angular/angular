# RouterTestingModule migration

This schematic converts deprecated `RouterTestingModule` usages in tests to `RouterModule`.

## How to run this migration?

The migration can be run using the following command:

```bash
ng generate @angular/core:router-testing-module-migration
```

By default, the migration will go over the entire application. If you want to apply this migration to a subset of the files, you can pass the path argument as shown below:

```bash
ng generate @angular/core:router-testing-module-migration --path src/app/sub-component
```

### How does it work?

The schematic looks at `*.spec.ts` files only. In each one it replaces `RouterTestingModule` in the `imports` of a `TestBed` configuration, adds the `RouterModule` import from `@angular/router`, and drops `RouterTestingModule` from the `@angular/router/testing` import. Your other entries and the rest of the test configuration are kept, with `RouterModule` appended to the end of the `imports` array.

Example:

```ts
// Before
import {RouterTestingModule} from '@angular/router/testing';

TestBed.configureTestingModule({
  imports: [RouterTestingModule.withRoutes(routes)],
});

// After
import {RouterModule} from '@angular/router';

TestBed.configureTestingModule({
  imports: [RouterModule.forRoot(routes)],
});
```

When no routes are given, or the routes array is empty and no options are passed, `RouterTestingModule` becomes `RouterModule` on its own:

```ts
// Before
import {RouterTestingModule} from '@angular/router/testing';

TestBed.configureTestingModule({
  imports: [RouterTestingModule],
});

// After
import {RouterModule} from '@angular/router';

TestBed.configureTestingModule({
  imports: [RouterModule],
});
```

Router options passed to `withRoutes` are carried over:

```ts
// Before
imports: [RouterTestingModule.withRoutes(routes, {initialNavigation: 'enabledBlocking'})],

// After
imports: [RouterModule.forRoot(routes, {initialNavigation: 'enabledBlocking'})],
```

The schematic also adds `provideLocationMocks()` to the providers of tests that read `SpyLocation.urlChanges`, because `RouterModule` does not set up the location mocks that `RouterTestingModule` did.

## Related

- Issue: angular/angular#54853
- Deprecation: angular/angular#54466
