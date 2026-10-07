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
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-one',
  template: '<div [ngClass]="{a: true, b: false}">Component One</div>',
  standalone: true,
  imports: [CommonModule]
})
export class ComponentOne {}

@Component({
  selector: 'app-two',
  template: '<div [ngClass]="{c: true, d: false}">Component Two</div>',
  standalone: true,
  imports: [CommonModule]
})
export class ComponentTwo {}
```
