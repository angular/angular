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
    "structural_directives.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /structural_directives.ts
```ts
import {Component, Directive, NgModule, TemplateRef} from '@angular/core';

@Directive({
    selector: '[if]',
    standalone: false
})
export class IfDirective {
  constructor(template: TemplateRef<any>) {}
}

@Component(
    {
    selector: 'my-component', template: '<ul #foo><li *if>{{salutation}} {{foo}}</li></ul>',
    standalone: false
})
export class MyComponent {
  salutation = 'Hello';
}

@NgModule({declarations: [IfDirective, MyComponent]})
export class MyModule {
}
```
