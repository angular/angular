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
    "structural_directives.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /structural_directives.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <ng-template *ngIf="someFlag" i18n>Content A</ng-template>
  <ng-container *ngIf="someFlag" i18n>Content B</ng-container>
`,
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
