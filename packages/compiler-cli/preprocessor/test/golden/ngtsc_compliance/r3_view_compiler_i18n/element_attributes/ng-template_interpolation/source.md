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
    "ng-template_interpolation.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /ng-template_interpolation.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <ng-template i18n-title title="Hello {{ name }}"></ng-template>
`,
    standalone: false
})
export class MyComponent {
  name = '';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
