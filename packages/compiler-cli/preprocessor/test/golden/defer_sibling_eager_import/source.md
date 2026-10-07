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
  template: 'Shared'
})
export class SharedDep {}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { SharedDep } from './shared-dep';

@Component({
  selector: 'parent-cmp',
  deferredImports: {
    block: [SharedDep],
  },
  template: `
    @defer (name block) {
      <shared-dep />
    }
  `
})
export class ParentCmp {}

@Component({
  selector: 'helper-cmp',
  imports: [SharedDep],
  template: `<shared-dep />`
})
export class HelperCmp {}
```
