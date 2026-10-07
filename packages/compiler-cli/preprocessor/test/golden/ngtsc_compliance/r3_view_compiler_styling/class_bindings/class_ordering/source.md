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
    "class_ordering.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /class_ordering.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `<div
    class="grape"
    [attr.class]="'banana'"
    [class.apple]="yesToApple"
    [class]="myClassExp"
    [class.orange]="yesToOrange"></div>`,
    standalone: false
})
export class MyComponent {
  myClassExp = {a: true, b: true};
  yesToApple = true;
  yesToOrange = true;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
