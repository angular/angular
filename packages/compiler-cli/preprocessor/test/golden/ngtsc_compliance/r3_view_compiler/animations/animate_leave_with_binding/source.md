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
    "animate_leave_with_binding.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /animate_leave_with_binding.ts
```ts
import {Component, signal} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <div>
      <p [animate.leave]="leaveClass()">Fading Content</p>
    </div>
  `,
})
export class MyComponent {
  leaveClass = signal('fade');
}
```
