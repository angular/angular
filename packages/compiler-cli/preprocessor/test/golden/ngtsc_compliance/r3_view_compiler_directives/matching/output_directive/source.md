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
    "output_directive.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /output_directive.ts
```ts
import {Component, Directive, EventEmitter, NgModule, Output} from '@angular/core';

@Directive({
    selector: '[someDirective]',
    standalone: false
})
export class SomeDirective {
  @Output() someDirective = new EventEmitter();
}

@Component({
    selector: 'my-component', template: '<div (someDirective)="noop()"></div>',
    standalone: false
})
export class MyComponent {
  noop() {}
}

@NgModule({declarations: [SomeDirective, MyComponent]})
export class MyModule {
}
```
