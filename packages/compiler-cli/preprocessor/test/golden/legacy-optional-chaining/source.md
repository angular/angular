# /app.component.ts
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div>{{ obj?.foo?.bar }}</div>
  `,
  standalone: true
})
export class AppComponent {
  obj: any = { foo: { bar: 'hello' } };
}
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
  "angularCompilerOptions": {
    "legacyOptionalChaining": true
  },
  "files": ["app.component.ts"]
}
```
