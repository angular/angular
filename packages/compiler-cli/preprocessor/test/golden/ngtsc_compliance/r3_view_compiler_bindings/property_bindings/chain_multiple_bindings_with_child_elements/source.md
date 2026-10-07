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
    "chain_multiple_bindings_with_child_elements.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /chain_multiple_bindings_with_child_elements.ts
```ts
import {Component, Directive, Input, NgModule} from '@angular/core';

@Directive({
    selector: 'span',
    standalone: false
})
export class SpanDir {
  @Input() someProp!: any;
}

@Component({
    template: `
    <button [title]="myTitle" [id]="buttonId" [tabindex]="1">
      <span [id]="1" [title]="'hello'" [someProp]="1 + 2"></span>
    </button>`,
    standalone: false
})
export class MyComponent {
  myTitle = 'hello';
  buttonId = 'special-button';
}

@NgModule({declarations: [MyComponent, SpanDir]})
export class MyMod {
}
```
