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
    "directive.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /directive.ts
```ts
import {Directive, Input, NgModule, Output} from '@angular/core';

@Directive({
    selector: '[my-directive]',
    standalone: false
})
export class MyDirective {
  @Input() directiveInput: any;
  @Input('renamedDirectiveInput') originalDirectiveInput: any;

  @Output() directiveOutput: any;
  @Output('renamedDirectiveOutput') originalDirectiveOutput: any;
}

@NgModule({declarations: [MyDirective]})
export class MyModule {
}
```
