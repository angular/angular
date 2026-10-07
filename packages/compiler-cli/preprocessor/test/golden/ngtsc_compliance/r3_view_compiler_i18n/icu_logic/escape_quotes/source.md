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
    "escape_quotes.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /escape_quotes.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <div i18n>{gender, select, single {'single quotes'} double {"double quotes"} other {other}}</div>
`,
    standalone: false
})
export class MyComponent {
  gender = 'male';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
