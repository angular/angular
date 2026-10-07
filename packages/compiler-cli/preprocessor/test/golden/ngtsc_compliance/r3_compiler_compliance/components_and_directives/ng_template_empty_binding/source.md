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
    "ng_template_empty_binding.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /ng_template_empty_binding.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-app', template: '<ng-template [id]=""></ng-template>',
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
