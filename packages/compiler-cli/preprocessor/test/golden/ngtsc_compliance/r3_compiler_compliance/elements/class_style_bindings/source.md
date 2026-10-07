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
    "class_style_bindings.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /class_style_bindings.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: '<div [class.error]="error" [style.background-color]="color"></div>',
    standalone: false
})
export class MyComponent {
  error = true;
  color = 'red';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
