# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.component.ts"]
}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';

// Standalone component with a plain-DOM template and no directive/pipe dependencies.
// This pins the instruction-set switch that depends only on compilation mode:
//   - LOCAL (golden.md): ngtsc cannot inspect dependencies, so hasDirectiveDependencies
//     is forced true and the FULL instruction set is emitted (ɵɵelementStart/End).
//   - OPTIMIZE (golden.opt.md): the component is standalone with no directive deps, so it
//     takes the DOM-only fast path (ɵɵdomElementStart/End).
// https://github.com/angular/angular/blob/e3ac727dfc/packages/compiler/src/render3/view/compiler.ts#L201-L203
@Component({
  selector: 'app-root',
  standalone: true,
  template: `<div><span>hi</span></div>`,
})
export class AppComponent {}
```
