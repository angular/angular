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
    "ng_template_directive.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /ng_template_directive.ts
```ts
import {Component, Directive, NgModule} from '@angular/core';

@Directive({
    selector: 'ng-template[directiveA]',
    standalone: false
})
export class DirectiveA {
}

@Component({
    selector: 'my-component',
    template: `
    <ng-template directiveA>Some content</ng-template>
  `,
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [DirectiveA, MyComponent]})
export class MyModule {
}
```
