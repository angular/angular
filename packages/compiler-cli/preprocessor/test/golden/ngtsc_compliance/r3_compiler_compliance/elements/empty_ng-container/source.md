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
    "empty_ng-container.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /empty_ng-container.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component', template: '<ng-container></ng-container>',
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
