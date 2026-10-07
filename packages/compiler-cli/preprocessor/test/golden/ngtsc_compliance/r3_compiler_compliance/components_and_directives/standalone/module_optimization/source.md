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
    "module_optimization.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /module_optimization.ts
```ts
import {Component, Directive, NgModule} from '@angular/core';

@Component({
  selector: 'standalone-cmp',
  template: '',
})
export class StandaloneCmp {
}

@Directive({})
export class StandaloneDir {
}

@NgModule({
  imports: [StandaloneCmp, StandaloneDir],
})
export class Module {
}
```
