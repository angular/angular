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
    "animate_enter_with_binding.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /animate_enter_with_binding.ts
```ts
import {Component, signal} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <div>
      <p [animate.enter]="enterClass()">Sliding Content</p>
    </div>
  `,
})
export class MyComponent {
  enterClass = signal('slide');
}
```
