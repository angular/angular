# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.component.ts", "shared-dep.ts"]
}
```

# /shared-dep.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'shared-dep',
  template: 'Shared',
  standalone: true
})
export class SharedDep {}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { SharedDep } from './shared-dep';

@Component({
  selector: 'app-comp',
  standalone: true,
  imports: [SharedDep],
  deferredImports: {
    blockA: [SharedDep],
    blockB: [SharedDep],
  },
  template: `
    @defer (name blockA) {
      <shared-dep />
    }
    @defer (name blockB) {
      <shared-dep />
    }
  `
})
export class AppComponent {}
```
