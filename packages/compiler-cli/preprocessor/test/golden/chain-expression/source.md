# /app.component.ts
```typescript
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <button (click)="a(); b()">Chain</button>
    <button (click)="sig.set(true); a()">Signal Chain</button>
  `,
  standalone: true
})
export class AppComponent {
  sig = signal(false);
  a() {}
  b() {}
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
  "files": ["app.component.ts"]
}
```
