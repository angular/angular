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
    "ng_container_directive.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /ng_container_directive.ts
```ts
import {Component, Directive, NgModule} from '@angular/core';

@Directive({
    selector: 'ng-container[directiveA]',
    standalone: false
})
export class DirectiveA {
}

@Component({
    selector: 'my-component',
    template: `
    <ng-container *ngIf="showing" directiveA>Some content</ng-container>
  `,
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [DirectiveA, MyComponent]})
export class MyModule {
}
```
