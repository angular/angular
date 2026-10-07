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
    "chain_multiple_bindings.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /chain_multiple_bindings.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    <button [attr.title]="myTitle" attr.id="{{buttonId}}" [attr.tabindex]="1"></button>
  `,
    standalone: false
})
export class MyComponent {
  myTitle = 'hello';
  buttonId = 'special-button';
}
```
