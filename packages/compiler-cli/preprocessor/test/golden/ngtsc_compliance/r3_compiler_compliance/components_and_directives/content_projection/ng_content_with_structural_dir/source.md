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
    "ng_content_with_structural_dir.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /ng_content_with_structural_dir.ts
```ts
import {Component, Directive, NgModule, TemplateRef} from '@angular/core';

@Component({
    selector: 'simple', template: '<ng-content *ngIf="showContent"></ng-content>',
    standalone: false
})
export class SimpleComponent {
}
```
