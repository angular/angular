# RouterTestingModule migration

This schematic migrates usages of `RouterTestingModule` inside tests to `RouterModule` and, when necessary, adds `provideLocationMocks()` to preserve behavior when `Location` or `LocationStrategy` are imported.

Run the schematic with:

<docs-code language="shell">

ng generate @angular/core:router-testing-migration

</docs-code>

## Options

| Option | Details                                                                                                                       |
| :----- | :---------------------------------------------------------------------------------------------------------------------------- |
| `path` | The path (relative to project root) to migrate. Defaults to `./`. Use this to incrementally migrate a subset of your project. |

## Examples

### Preserve router options

Before:

```ts
TestBed.configureTestingModule({
  imports: [RouterTestingModule.withRoutes(routes, { initialNavigation: 'enabledBlocking' })]
});
```

After:

```ts
TestBed.configureTestingModule({
  imports: [RouterModule.forRoot(routes, { initialNavigation: 'enabledBlocking' })]
});
```

### Add provideLocationMocks when Location is used

Before:

```ts
import { Location } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

describe('test', () => {
  let mockLocation : Location;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule]
    });
  });
});
```

After:

```ts
import { RouterModule } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { Location } from '@angular/common';

describe('test', () => {
  let mockLocation : Location;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule],
      providers: [provideLocationMocks()]
    });
  });
});
```
