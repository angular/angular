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
    "export_as.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /export_as.ts
```ts
import {Directive, NgModule} from '@angular/core';

@Directive({
    selector: '[some-directive]', exportAs: 'someDir, otherDir',
    standalone: false
})
export class SomeDirective {
}

@NgModule({declarations: [SomeDirective]})
export class MyModule {
}
```
