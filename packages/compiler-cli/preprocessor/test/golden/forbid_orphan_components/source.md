# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "angularCompilerOptions": {
    "forbidOrphanComponents": true
  },
  "files": ["test.ts"]
}
```

# /test.ts
```ts
import { Component, NgModule } from '@angular/core';

@Component({ selector: 'declared-cmp', template: '...', standalone: false })
export class DeclaredCmp {}

@NgModule({ declarations: [DeclaredCmp] })
export class DeclaringModule {}

@Component({ selector: 'standalone-cmp', template: '...' })
export class StandaloneCmp {}
```
