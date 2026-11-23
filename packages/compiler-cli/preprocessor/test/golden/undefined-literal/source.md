# /app.component.ts
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div>{{ undefined }}</div>
    <div [id]="undefined"></div>
  `,
  standalone: true
})
export class AppComponent {}
```

# /tsconfig.json
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "target": "ES2022",
    "module": "es2022",
    "moduleResolution": "node"
  },
  "files": ["app.component.ts"]
}
```
