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
    "structural_directives_same_placeholder.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /structural_directives_same_placeholder.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <div i18n>
    <div *ngIf="someFlag">Content</div>
    <div *ngIf="someFlag">
      <div *ngIf="someFlag">Content</div>
    </div>

    <img *ngIf="someOtherFlag" />
    <img *ngIf="someOtherFlag" />
  </div>
`,
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
