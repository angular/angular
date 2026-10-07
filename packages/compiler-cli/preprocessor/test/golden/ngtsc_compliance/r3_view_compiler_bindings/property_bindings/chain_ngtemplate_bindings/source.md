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
    "chain_ngtemplate_bindings.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /chain_ngtemplate_bindings.ts
```ts
import {Component} from '@angular/core';

@Component(
    {
    template: '<ng-template [title]="myTitle" [id]="buttonId" [tabindex]="1"></ng-template>',
    standalone: false
})
export class MyComponent {
  myTitle = 'hello';
  buttonId = 'custom-id';
}
```
