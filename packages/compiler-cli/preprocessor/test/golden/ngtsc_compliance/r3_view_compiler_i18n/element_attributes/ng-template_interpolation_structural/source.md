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
    "ng-template_interpolation_structural.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /ng-template_interpolation_structural.ts
```ts
import {Component, NgModule, Pipe} from '@angular/core';

@Pipe({
    name: 'uppercase',
    standalone: false
})
export class UppercasePipe {
  transform(v: any) {}
}

@Component({
    selector: 'my-component',
    template: `
  <ng-template *ngIf="true" i18n-title title="Hello {{ name }}"></ng-template>
`,
    standalone: false
})
export class MyComponent {
  name = '';
}

@NgModule({declarations: [UppercasePipe, MyComponent]})
export class MyModule {
}
```
