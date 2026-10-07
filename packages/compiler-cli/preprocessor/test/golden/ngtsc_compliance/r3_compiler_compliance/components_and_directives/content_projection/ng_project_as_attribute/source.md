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
    "ng_project_as_attribute.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /ng_project_as_attribute.ts
```ts
import {Component} from '@angular/core';

@Component({
    selector: 'my-app', template: '<div *ngIf="show" ngProjectAs=".someclass"></div>',
    standalone: false
})
export class MyApp {
  show = true;
}
```
