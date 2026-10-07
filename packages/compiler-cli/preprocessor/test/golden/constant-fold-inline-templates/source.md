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

const GREETING = 'Hello';
const AUDIENCE = 'World';

@Component({
  selector: 'app-root',
  template: `<div>` + GREETING + ` <span>${AUDIENCE}</span></div>`,
  standalone: true,
})
export class AppComponent {}
```
