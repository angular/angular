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
    "animate_leave_with_string.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /animate_leave_with_string.ts
```ts
import {Component} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <div>
      <p animate.leave="fade">Fading Content</p>
    </div>
  `,
})
export class MyComponent {
}
```
