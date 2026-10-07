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
    "named_interpolations.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /named_interpolations.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <div i18n>
    Named interpolation: {{ valueA // i18n(ph="PH_A") }}
    Named interpolation with spaces: {{ valueB // i18n(ph="PH B") }}
  </div>
`,
    standalone: false
})
export class MyComponent {
  valueA = '';
  valueB = '';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
