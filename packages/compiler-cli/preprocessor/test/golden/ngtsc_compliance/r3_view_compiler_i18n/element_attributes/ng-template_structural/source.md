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
    "ng-template_structural.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /ng-template_structural.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <ng-template *ngIf="visible" i18n-title title="Hello">Test</ng-template>
`,
    standalone: false
})
export class MyComponent {
  visible = false;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
