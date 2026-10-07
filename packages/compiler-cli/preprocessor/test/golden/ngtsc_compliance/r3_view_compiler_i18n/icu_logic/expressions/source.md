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
    "expressions.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /expressions.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <div i18n>{gender, select, male {male of age: {{ ageA + ageB + ageC }}} female {female} other {other}}</div>
`,
    standalone: false
})
export class MyComponent {
  gender = 'female';
  ageA = 1;
  ageB = 2;
  ageC = 3;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
