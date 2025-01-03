## Cleanup unused imports migration
Automated migration that removes all unused standalone imports across the entire project. It can be
run using:

```bash
ng generate @angular/core:cleanup-unused-imports
```

**Before:**
```typescript
import { Component } from '@angular/core';
import { UnusedDirective } from './unused';

@Component({
  template: 'Hello',
  imports: [UnusedDirective],
})
export class MyComp {}
```

**After:**
```typescript
import { Component } from '@angular/core';

@Component({
  template: 'Hello',
  imports: [],
})
export class MyComp {}
```
