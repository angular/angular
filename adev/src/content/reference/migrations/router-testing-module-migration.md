# RouterTestingModule migration

This schematic migrates usages of `RouterTestingModule` inside tests to `RouterModule`.

When a test imports `SpyLocation` from `@angular/common/testing` and uses `urlChanges` property , the schematic will also add `provideLocationMocks()` to preserve the original behavior.

Run the schematic with:

```shell
ng generate @angular/core:router-testing-module-migration
```

## Options

| Option | Details                                                                                                                       |
| :----- | :---------------------------------------------------------------------------------------------------------------------------- |
| `path` | The path (relative to project root) to migrate. Defaults to `./`. Use this to incrementally migrate a subset of your project. |

## Examples

### Preserve router options

Before:

```ts
import {RouterTestingModule} from '@angular/router/testing';
import {SpyLocation} from '@angular/common/testing';

describe('test', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes, {initialNavigation: 'enabledBlocking'})],
    });
  });
});
```

After:

```ts
import {RouterModule} from '@angular/router';
import {SpyLocation} from '@angular/common/testing';

describe('test', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot(routes, {initialNavigation: 'enabledBlocking'})],
    });
  });
});
```

### Add provideLocationMocks when `SpyLocation` is imported and `urlChanges` is used

Before:

```ts
import {RouterTestingModule} from '@angular/router/testing';
import {SpyLocation} from '@angular/common/testing';

describe('test', () => {
  let spy: SpyLocation;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
    });
    spy = TestBed.inject(SpyLocation);
  });

  it('Awesome test', () => {
    expect(spy.urlChanges).toBeDefined();
  });
});
```

After:

```ts
import {RouterModule} from '@angular/router';
import {provideLocationMocks} from '@angular/common/testing';
import {SpyLocation} from '@angular/common/testing';

describe('test', () => {
  let spy: SpyLocation;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule],
      providers: [provideLocationMocks()],
    });
    spy = TestBed.inject(SpyLocation);
  });

  it('Awesome test', () => {
    expect(spy.urlChanges).toBeDefined();
  });
});
```
