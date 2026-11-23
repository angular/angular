# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["hello.component.ts"]
}
```

# /hello.component.ts
```ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hello',
  template: '<div *ngIf="name">Hello, {{name}}!</div>',
  imports: [CommonModule],
})
export class HelloComponent {
  name = 'World';
}
```
