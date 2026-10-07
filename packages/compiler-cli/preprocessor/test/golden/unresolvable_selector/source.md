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
const DYNAMIC_SELECTOR = 'app-' + Math.random();

@Component({
  selector: DYNAMIC_SELECTOR,
  template: '<div>Hello World</div>',
  standalone: true,
})
export class BadComponent {}
```
