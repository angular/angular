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
    "animate_enter_with_structural_directive.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /animate_enter_with_structural_directive.ts
```ts
import {Component, Directive} from '@angular/core';

@Directive({
  selector: '[any-structural-directive]',
})
export class AnyStructuralDirective {}

@Component({
  selector: 'my-component',
  imports: [AnyStructuralDirective],
  template: `
    <div>
      <p *any-structural-directive animate.enter="slide">Sliding Content</p>
    </div>
  `,
})
export class MyComponent {}
```
