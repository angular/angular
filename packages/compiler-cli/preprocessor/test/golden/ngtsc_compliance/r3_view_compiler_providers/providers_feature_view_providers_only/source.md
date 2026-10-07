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
    "providers_feature_view_providers_only.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /providers_feature_view_providers_only.ts
```ts
import {Component, NgModule} from '@angular/core';

abstract class Greeter {
  abstract greet(): string;
}

class GreeterEN implements Greeter {
  greet() {
    return 'Hi';
  }
}

@Component({
    selector: 'my-component', template: '<div></div>', viewProviders: [GreeterEN],
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
