# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["types.ts", "app.component.ts"]
}
```

# /types.ts
```ts
/**
 * @fileoverview Types without pre-existing imports.
 */

export interface AppData {
  name: string;
}
```

# /app.component.ts
```ts
/**
 * @fileoverview Component with pre-existing imports and fileoverview.
 */

import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<div>Fileoverview Test</div>',
  standalone: true,
})
export class AppComponent {}
```
