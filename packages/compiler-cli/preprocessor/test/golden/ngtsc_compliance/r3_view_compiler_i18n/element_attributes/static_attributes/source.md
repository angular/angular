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
    "static_attributes.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /static_attributes.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <div id="static" i18n-title="m|d" title="introduction"></div>
  `,
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
