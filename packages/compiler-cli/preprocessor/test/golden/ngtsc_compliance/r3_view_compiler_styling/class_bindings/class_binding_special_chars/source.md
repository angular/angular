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
    "class_binding_special_chars.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /class_binding_special_chars.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    <div [class.text-primary/80]="expr"
      [class.data-active:text-green-300/80]="expr"
      [class.data-[size='large']:p-8]="expr"></div>`,
})
export class MyComponent {
  expr = true;
}
```
