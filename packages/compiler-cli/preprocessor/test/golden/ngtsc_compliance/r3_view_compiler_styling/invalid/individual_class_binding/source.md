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
    "individual_class_binding.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /individual_class_binding.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: '<div class.something="{{isEnabled}}"></div>',
    standalone: false
})
export class MyComponent {
  isEnabled = true;
}
```
