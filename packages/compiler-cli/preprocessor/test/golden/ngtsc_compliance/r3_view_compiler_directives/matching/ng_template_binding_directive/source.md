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
    "ng_template_binding_directive.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /ng_template_binding_directive.ts
```ts
import {Component, Directive, Input, NgModule} from '@angular/core';

@Directive({
    selector: '[someDirective]',
    standalone: false
})
export class SomeDirective {
  @Input() someDirective: any;
}

@Component({
    selector: 'my-component',
    template: '<ng-template [someDirective]="true"></ng-template>',
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [SomeDirective, MyComponent]})
export class MyModule {
}
```
