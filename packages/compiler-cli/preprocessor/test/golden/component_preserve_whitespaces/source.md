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

@Component({
  selector: 'preserve-ws-cmp',
  template: '<div>  \n  Preserved  \n  </div>',
  preserveWhitespaces: true,
  standalone: true
})
export class PreserveWsCmp {}

@Component({
  selector: 'no-preserve-ws-cmp',
  template: '<div>  \n  Not Preserved  \n  </div>',
  preserveWhitespaces: false,
  standalone: true
})
export class NoPreserveWsCmp {}
```
