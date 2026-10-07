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
    "multiple_wildcards.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /multiple_wildcards.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    template: `
    <ng-content></ng-content>
    <ng-content select="[spacer]"></ng-content>
    <ng-content></ng-content>
  `,
    standalone: false
})
class Cmp {
}

@NgModule({declarations: [Cmp]})
class Module {
}
```
