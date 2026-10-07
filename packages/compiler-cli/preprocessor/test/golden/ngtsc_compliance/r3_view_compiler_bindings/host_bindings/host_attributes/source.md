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
    "host_attributes.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /host_attributes.ts
```ts
import {Directive, NgModule} from '@angular/core';

@Directive({
    selector: '[hostAttributeDir]', host: { 'aria-label': 'label' },
    standalone: false
})
export class HostAttributeDir {
}

@NgModule({declarations: [HostAttributeDir]})
export class MyModule {
}
```
