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
    "static_bindings.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /static_bindings.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `<div
    class="    foo  "
    style="width:100px"
    [attr.class]="'round'"
    [attr.style]="'height:100px'"></div>`,
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
