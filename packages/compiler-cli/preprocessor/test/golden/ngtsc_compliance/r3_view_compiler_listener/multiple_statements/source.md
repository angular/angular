# /tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "esnext",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": false,
    "moduleResolution": "node"
  },
  "files": [
    "multiple_statements.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /multiple_statements.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'my-component',
  host: {'(click)': '$event.preventDefault(); $event.target'},
  template: `
    <div (click)="$event.preventDefault(); $event.target"></div>
  `
})
export class MyComponent {
}
```
