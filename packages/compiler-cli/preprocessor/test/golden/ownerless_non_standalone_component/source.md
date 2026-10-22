# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["ownerless.component.ts"]
}
```

# /ownerless.component.ts
```ts
import { Component } from '@angular/core';

// A non-standalone component that is not declared by any NgModule in the program.
// The compiler must still EMIT its definition (matching ngtsc) rather than aborting
// the compilation — see fix(compiler): emit ownerless non-standalone components.
// This case must keep producing output in optimize mode, so golden.opt.md guards it.
@Component({
  selector: 'app-ownerless',
  template: '<div>Ownerless</div>',
  standalone: false,
})
export class OwnerlessComponent {}
```
