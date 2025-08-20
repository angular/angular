## Remove `Router.getCurrentNavigation` migration
Replaces the usages of the deprecated `Router.getCurrentNavigation` method with the new `Router.currentNavigation()` signal:

### Before
```typescript
import { Router } from '@angular/router';

export class MyService {
  router = inject(Router);   

  someMethod() {
    const currentNavigation = this.router.getCurrentNavigation();
  }
}
```

### After
```typescript
import { Router } from '@angular/router';

export class MyService {
  router = inject(Router);   

  someMethod() {
    const currentNavigation = this.router.currentNavigation();
  }
}
```
