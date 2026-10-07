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
    "style_binding.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /style_binding.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component', template: `<div [style]="myStyleExp"></div>`,
    standalone: false
})
export class MyComponent {
  myStyleExp = [{color: 'red'}, {color: 'blue', duration: 1000}]
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
