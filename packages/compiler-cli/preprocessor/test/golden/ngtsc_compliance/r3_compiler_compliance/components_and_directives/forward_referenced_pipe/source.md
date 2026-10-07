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
    "forward_referenced_pipe.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /forward_referenced_pipe.ts
```ts
import { Component, NgModule, Pipe } from '@angular/core';

@Component({
    selector: 'host-binding-comp',
    template: `
    <div [attr.style]="{} | my_forward_pipe">...</div>
  `,
    standalone: false
})
export class HostBindingComp {
}

@Pipe({
    name: 'my_forward_pipe',
    standalone: false
})
class MyForwardPipe {
  transform(param:unknown) {}
}

@NgModule({declarations: [HostBindingComp, MyForwardPipe]})
export class MyModule {
}
```
