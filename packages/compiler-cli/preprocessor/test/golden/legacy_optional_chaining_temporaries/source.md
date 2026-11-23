# /app.component.ts
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div>{{ obj?.foo?.bar }}</div>
    <div>{{ arr?.[index]?.name }}</div>
    <div>{{ svc?.lookup()?.value }}</div>
    <div>{{ obj?.foo?.bar ?? fallback }}</div>
    <div>{{ matrix?.[row]?.[col] }}</div>
  `,
  standalone: true
})
export class AppComponent {
  obj: any = { foo: { bar: 'hello' } };
  arr: any[] = [];
  index = 0;
  svc: any;
  fallback = 'none';
  matrix: any[][] = [];
  row = 0;
  col = 0;
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
