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
    "namespace_attr.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /namespace_attr.ts
```ts
import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
    <svg:use [attr.xlink:href]="value"/>
    <svg:use id="foo" xlink:href="/foo" name="foo"/>
  `
})
export class MyComponent {
  value: any;
}
```
