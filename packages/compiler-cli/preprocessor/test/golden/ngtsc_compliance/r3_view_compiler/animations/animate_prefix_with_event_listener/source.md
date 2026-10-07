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
    "animate_prefix_with_event_listener.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /animate_prefix_with_event_listener.ts
```ts
import {Component} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <div>
      <p (animateABC)="doSomething()">Fading Content</p>
    </div>
  `,
})
export class MyComponent {
  doSomething() {}
}
```
