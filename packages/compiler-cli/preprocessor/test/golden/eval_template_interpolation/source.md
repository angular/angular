# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.component.ts", "constants.ts"]
}
```

# /constants.ts
```ts
export const GREETING = 'Hello!';
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { GREETING } from './constants';

@Component({
  selector: 'test-cmp',
  template: `<p>${GREETING}</p>`,
  standalone: true,
})
export class TestComponent {}
```
