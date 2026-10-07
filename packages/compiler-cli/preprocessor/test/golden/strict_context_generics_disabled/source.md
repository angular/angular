# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "es2022",
    "module": "es2022"
  },
  "angularCompilerOptions": {
    "strictContextGenerics": false
  },
  "files": ["app.component.ts", "generic.component.ts"]
}
```

# /generic.component.ts
```ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-generic',
  template: '{{ value }}',
  standalone: true
})
export class GenericComponent<T> {
  @Input() value: T | null = null;
}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { GenericComponent } from './generic.component';

@Component({
  selector: 'app-root',
  template: `
    <app-generic [value]="'string'"></app-generic>
  `,
  standalone: true,
  imports: [GenericComponent]
})
export class AppComponent {}
```
