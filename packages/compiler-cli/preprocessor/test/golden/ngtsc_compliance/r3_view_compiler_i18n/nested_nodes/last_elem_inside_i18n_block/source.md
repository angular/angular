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
    "last_elem_inside_i18n_block.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /last_elem_inside_i18n_block.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <div i18n>{{ text }}<h1 i18n-title title="{{ attr }}"></h1></div>
  `,
    standalone: false
})
export class MyComponent {
  attr: any;
  text: any;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
