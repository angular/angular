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
    "unique_template_function_names_ng_content.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /unique_template_function_names_ng_content.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'a-component',
    template: `
    <ng-content *ngIf="show"></ng-content>
  `,
    standalone: false
})
export class AComponent {
  show = true;
}

@Component({
    selector: 'b-component',
    template: `
    <ng-content *ngIf="show"></ng-content>
  `,
    standalone: false
})
export class BComponent {
  show = true;
}

@NgModule({declarations: [AComponent, BComponent]})
export class AModule {
}
```
