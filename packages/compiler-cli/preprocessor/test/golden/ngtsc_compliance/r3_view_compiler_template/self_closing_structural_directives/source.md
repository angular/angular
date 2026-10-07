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
    "self_closing_structural_directives.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /self_closing_structural_directives.ts
```ts
import {Component} from '@angular/core';

@Component({
  selector: 'other-component',
  template: '',
})
export class OtherComponent {}

@Component({
  selector: 'my-component',
  imports: [OtherComponent],
  template: `
  <div i18n>
    <img *ngIf="flag" />
    <other-component *ngIf="flag" />
    <ng-template *ngIf="flag" />
    <ng-container *ngIf="flag" />
    <ng-content *ngIf="flag" />
  </div>
`,
})
export class MyComponent {}
```
