# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.component.ts", "eager-cmp.ts"]
}
```

# /eager-cmp.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'eager-cmp',
  template: 'Eager',
  standalone: true
})
export class EagerCmp {}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { EagerCmp } from './eager-cmp';

@Component({
  selector: 'app-comp',
  standalone: true,
  imports: [EagerCmp],
  deferredImports: {
    blockA: [],
  },
  template: `
    @defer (name blockA) {
      <eager-cmp />
    }
  `
})
export class AppComponent {}
```
