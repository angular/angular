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
    "view_tokens_di.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /view_tokens_di.ts
```ts
import {ChangeDetectorRef, Component, ElementRef, NgModule, ViewContainerRef} from '@angular/core';

@Component({
    selector: 'my-component', template: '',
    standalone: false
})
export class MyComponent {
  constructor(public el: ElementRef, public vcr: ViewContainerRef, public cdr: ChangeDetectorRef) {}
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
