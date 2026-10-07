# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "es2022",
    "module": "es2022",
    "moduleResolution": "node"
  },
  "files": ["test.ts"]
}
```

# /test.ts
```ts
import { Component, Directive, Injectable } from '@angular/core';

export class Service {}

@Directive({
  selector: '[appDir]',
  standalone: true,
  providers: [Service]
})
export class TestDirective {}

@Component({
  selector: 'app-test',
  template: '<div></div>',
  standalone: true,
  providers: [Service],
  viewProviders: [Service]
})
export class TestComponent {}
```
