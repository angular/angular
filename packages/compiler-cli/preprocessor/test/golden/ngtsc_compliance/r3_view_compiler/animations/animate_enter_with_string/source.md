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
    "animate_enter_with_string.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /animate_enter_with_string.ts
```ts
import {Component} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <div>
      <p animate.enter="slide">Sliding Content</p>
    </div>
  `,
})
export class MyComponent {
}
```
