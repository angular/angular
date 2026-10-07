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
import { EXTERNAL_IMPORTS } from '@not-installed/components';

@Component({
  selector: 'app-root',
  template: '<div></div>',
  standalone: true,
  imports: EXTERNAL_IMPORTS,
})
export class AppComponent {}
```
