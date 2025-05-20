## Move `DOCUMENT` migration
Replaces imports of `DOCUMENT` from `@angular/core` to `@angular/common`:

### Before
```typescript
import { Component, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component()
export class MyComp {
  document = inject(DOCUMENT);
}
```

### After
```typescript
import { Component, inject, DOCUMENT } from '@angular/core';

@Component()
export class MyComp {
  document = inject(DOCUMENT);
}
```
