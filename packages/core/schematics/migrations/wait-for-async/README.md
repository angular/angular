## async -> waitForAsync migration

Automatically migrates from `async` to `waitForAsync` by changing function calls and renaming imports.

#### Before
```ts
import { async } from '@angular/core/testing';

it('should work', async(() => {
  // async testing logic
}));
```

#### After
```ts
import { waitForAsync } from '@angular/core/testing';

it('should work', waitForAsync(() => {
  // async testing logic
}));
```
