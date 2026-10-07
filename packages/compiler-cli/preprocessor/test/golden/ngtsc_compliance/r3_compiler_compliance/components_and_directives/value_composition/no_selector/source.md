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
    "no_selector.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /no_selector.ts
```ts
import {Component, Directive, NgModule} from '@angular/core';

@Directive({
    selector: 'router-outlet',
    standalone: false
})
export class RouterOutlet {
}

@Component({
    template: '<router-outlet></router-outlet>',
    standalone: false
})
export class EmptyOutletComponent {
}

@NgModule({declarations: [EmptyOutletComponent, RouterOutlet]})
export class MyModule {
}
```
