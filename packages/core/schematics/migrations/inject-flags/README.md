## Remove `InjectFlags` migration
Replaces the usages of the deprecated `InjectFlags` symbol with its non-deprecated equivalent,
for example:

### Before
```typescript
import { inject, InjectFlags, Directive, ElementRef } from '@angular/core';

@Directive()
export class Dir {
  element = inject(ElementRef, InjectFlags.Optional | InjectFlags.Host | InjectFlags.SkipSelf);
}
```

### After
```typescript
import { inject, Directive, ElementRef } from '@angular/core';

@Directive()
export class Dir {
  element = inject(ElementRef, { optional: true, host: true, skipSelf: true });
}
```
