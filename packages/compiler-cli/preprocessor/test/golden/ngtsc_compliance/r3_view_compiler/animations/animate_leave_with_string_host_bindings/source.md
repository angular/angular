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
    "animate_leave_with_string_host_bindings.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /animate_leave_with_string_host_bindings.ts
```ts
import {Component} from '@angular/core';

@Component({
    selector: 'child-component',
    template: `<p>Fading Content</p>`,
    host: {'animate.leave': 'fade'},
})
export class ChildComponent {
}

@Component({
    selector: 'my-component',
    imports: [ChildComponent],
    template: `
      <child-component animate.leave="slide"></child-component>
  `,
})
export class MyComponent {
}
```
