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
import { Component, Directive } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MyLocalDirective],
  template: `<div myLocal></div>`
})
export class AppComponent {}

@Directive({
  selector: '[myLocal]',
  standalone: true
})
export class MyLocalDirective {}
```
