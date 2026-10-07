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
    "providers_feature_no_providers.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /providers_feature_no_providers.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component', template: '<div></div>',
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
