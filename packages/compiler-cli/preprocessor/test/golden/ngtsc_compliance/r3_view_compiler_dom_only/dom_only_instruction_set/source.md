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
    "dom_only_instruction_set.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /dom_only_instruction_set.ts
```ts
import {Component} from '@angular/core';

// A standalone component with a plain-DOM template and no directive/pipe dependencies.
// Whether it is compiled to the DOM-only instruction set depends solely on the compilation
// mode:
//   - Full compile: the compiler can see that the template has no directive dependencies, so
//     it takes the DOM-only fast path (`ɵɵdomElementStart`/`ɵɵdomElementEnd`).
//   - Local compile: the compiler cannot inspect the component's dependencies, so it assumes
//     directive dependencies may exist and emits the full instruction set
//     (`ɵɵelementStart`/`ɵɵelementEnd`).
@Component({
  standalone: true,
  template: '<div><span>hi</span></div>',
})
export class DomOnlyCmp {}
```
