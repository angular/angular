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
    "interpolation_complex_expressions_use_null.ts"
  ],
  "angularCompilerOptions": {
    "legacyOptionalChaining": true
  }
}
```

# /interpolation_complex_expressions_use_null.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <div i18n-title title="{{valueA.getRawValue()?.getTitle()}} title"></div>
  `,
    standalone: false
})
export class MyComponent {
  valueA!: any;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
