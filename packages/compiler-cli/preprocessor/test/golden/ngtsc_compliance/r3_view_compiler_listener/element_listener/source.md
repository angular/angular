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
    "element_listener.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /element_listener.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component', template: `<div (click)="onClick($event); 1 == 1"></div>`,
    standalone: false
})
export class MyComponent {
  onClick(event: any) {}
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
