## Inject migration
Automated migration that converts classes using constructor-based injection to the `inject`
function. It can be run using:

```bash
ng generate @angular/core:inject-migration
```

**Before:**
```typescript
import { Component, Inject, Optional } from '@angular/core';
import { MyService } from './service';
import { DI_TOKEN } from './token';

@Component({})
export class MyComp {
  constructor(private service: MyService, @Inject(TOKEN) @Optional() readonly token: string) {}
}
```

**After:**
```typescript
import { Component, inject } from '@angular/core';
import { MyService } from './service';
import { DI_TOKEN } from './token';

@Component({})
export class MyComp {
  private service = inject(MyService);
  readonly token = inject(DI_TOKEN, { optional: true });
}
```

### Options
The migration includes several options to customize its output.

#### `path`
Determines which sub-path in your project should be migrated. Pass in `.` or leave it blank to
migrate the entire directory.

#### `migrateAbstractClasses`
Angular doesn't validate that parameters of abstract classes are injectable. This means that the
migration can't reliably migrate them to `inject` without risking breakages which is why they're
disabled by default. Enable this option if you want abstract classes to be migrated, but note
that you may have to **fix some breakages manually**.

#### `backwardsCompatibleConstructors`
By default the migration tries to clean up the code as much as it can, which includes deleting
parameters from the constructor, or even the entire constructor if it doesn't include any code.
In some cases this can lead to compilation errors when classes with Angular decorators inherit from
other classes with Angular decorators. If you enable this option, the migration will generate an
additional constructor signature to keep it backwards compatible, at the expense of more code.

**Before:**
```typescript
import { Component } from '@angular/core';
import { MyService } from './service';

@Component({})
export class MyComp {
  constructor(private service: MyService) {}
}
```

**After:**
```typescript
import { Component } from '@angular/core';
import { MyService } from './service';

@Component({})
export class MyComp {
  private service = inject(MyService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}
}
```

#### `nonNullableOptional`
If injection fails for a parameter with the `@Optional` decorator, Angular returns `null` which
means that the real type of any `@Optional` parameter will be `| null`. However, because decorators
cannot influence their types, there is a lot of existing code whose type is incorrect. The type is
fixed in `inject()` which can cause new compilation errors to show up. If you enable this option,
the migration will produce a non-null assertion after the `inject()` call to match the old type,
at the expense of potentially hiding type errors.

**Note:** non-null assertions won't be added to parameters that are already typed to be nullable,
because the code that depends on them likely already accounts for their nullability.

**Before:**
```typescript
import { Component, Inject, Optional } from '@angular/core';
import { TOKEN_ONE, TOKEN_TWO } from './token';

@Component({})
export class MyComp {
  constructor(
    @Inject(TOKEN_ONE) @Optional() private tokenOne: number,
    @Inject(TOKEN_TWO) @Optional() private tokenTwo: string | null) {}
}
```

**After:**
```typescript
import { Component, inject } from '@angular/core';
import { TOKEN_ONE, TOKEN_TWO } from './token';

@Component({})
export class MyComp {
  // Note the `!` at the end.
  private tokenOne = inject(TOKEN_ONE, { optional: true })!;

  // Does not have `!` at the end, because the type was already nullable.
  private tokenTwo = inject(TOKEN_TWO, { optional: true });
}
```
