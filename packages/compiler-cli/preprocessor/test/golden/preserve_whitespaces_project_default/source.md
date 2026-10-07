# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "angularCompilerOptions": {
    "preserveWhitespaces": true
  },
  "files": ["test.component.ts"]
}
```

# /test.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'project-default',
  template: '<div>   <span> a </span>   </div>',
})
export class ProjectDefaultComponent {}

@Component({
  selector: 'component-override',
  template: '<div>   <span> b </span>   </div>',
  preserveWhitespaces: false,
})
export class ComponentOverrideComponent {}
```
