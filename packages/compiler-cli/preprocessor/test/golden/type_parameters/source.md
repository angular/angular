# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "es2022",
    "module": "es2022"
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
  constructor(public val: T) {}
}

@Component({
  selector: 'app-default-generic',
  template: '{{ value }}',
  standalone: true
})
export class DefaultGenericComponent<T extends object = {}> {
  @Input() value: T | null = null;
}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { GenericComponent, DefaultGenericComponent } from './generic.component';

@Component({
  selector: 'app-root',
  template: `
    <app-generic [value]="'string'"></app-generic>
    <app-generic [value]="123"></app-generic>
    <app-default-generic [value]="{a: 1}"></app-default-generic>
  `,
  standalone: true,
  imports: [GenericComponent, DefaultGenericComponent]
})
export class AppComponent {}
```
