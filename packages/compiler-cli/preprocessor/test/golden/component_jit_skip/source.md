# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.component.ts"]
}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';

// A `jit: true` component must be skipped entirely by AOT compilation, even when its
// template is not statically analyzable (here it is a runtime function parameter).
export function dynamic(template: string) {
  @Component({ template: template, jit: true })
  class TempCmp {}
}

@Component({
  selector: 'app-root',
  template: '<div>Static</div>',
  standalone: true,
})
export class AppComponent {}
```
