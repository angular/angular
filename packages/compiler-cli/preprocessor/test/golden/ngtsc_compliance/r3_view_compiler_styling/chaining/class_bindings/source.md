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
    "class_bindings.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /class_bindings.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `<div
   [class.apple]="yesToApple"
   [class.orange]="yesToOrange"
   [class.tomato]="yesToTomato"></div>`,
    standalone: false
})
export class MyComponent {
  yesToApple = true;
  yesToOrange = true;
  yesToTomato = false;
}
```
