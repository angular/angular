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
    "animate_enter_with_string_host_bindings.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /animate_enter_with_string_host_bindings.ts
```ts
import {Component} from '@angular/core';

@Component({
  selector: 'child-component',
  host: {'animate.enter': 'fade'},
  template: `<p>Sliding Content</p>`,
})
export class ChildComponent {
}

@Component({
  selector: 'my-component',
  imports: [ChildComponent],
  template: `
    <child-component animate.enter="slide"></child-component>
  `,
})
export class MyComponent {
}
```
