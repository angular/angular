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
    "style_ordering.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /style_ordering.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component', template: `<div [style.background-image]="myImage"></div>`,
    standalone: false
})
export class MyComponent {
  myImage = 'url(foo.jpg)';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
