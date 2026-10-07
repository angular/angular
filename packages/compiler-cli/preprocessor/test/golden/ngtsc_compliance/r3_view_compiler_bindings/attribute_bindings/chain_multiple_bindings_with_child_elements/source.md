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
import {Component} from '@angular/core';

@Component({
    template: `
    <button [attr.title]="myTitle" [attr.id]="buttonId" [attr.tabindex]="1">
      <span [attr.id]="1" [attr.title]="'hello'" [attr.some-attr]="1 + 2"></span>
    </button>`,
    standalone: false
})
export class MyComponent {
  myTitle = 'hello';
  buttonId = 'special-button';
}
```
