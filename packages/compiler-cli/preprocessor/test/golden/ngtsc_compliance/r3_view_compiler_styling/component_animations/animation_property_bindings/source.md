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
    "animation_property_bindings.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /animation_property_bindings.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <div [@foo]='exp'></div>
    <div @bar></div>
    <div [@baz]></div>`,
    standalone: false
})
export class MyComponent {
  exp = '';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
