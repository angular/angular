## Invoke the `Router.lastSuccessfulNavigation` signal migration
`Router.lastSuccessfulNavigation` is now a signal, this migration ensures `Router.getCurrentNavigation` is invoked:

### Before
```typescript
import { Router } from '@angular/router';

export class MyService {
  router = inject(Router);   

  someMethod() {
    const navigation = this.router.lastSuccessfulNavigation;
  }
}
```

### After
```typescript
import { Router } from '@angular/router';

export class MyService {
  router = inject(Router);   

  someMethod() {
    const navigation = this.router.lastSuccessfulNavigation();
  }
}
```
