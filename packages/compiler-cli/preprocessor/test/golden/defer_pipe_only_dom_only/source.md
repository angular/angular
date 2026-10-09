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
import { Component, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'myPipe',
  standalone: true
})
export class MyPipe implements PipeTransform {
  transform(value: string): string { return value; }
}

// Directive-free standalone component whose only dependency is a pipe used inside
// a @defer block, declared in the same file (statically resolved). The reference
// counts only directives in `wholeTemplateUsed`, so this has no directive deps.
// In OPTIMIZE mode (golden.opt.md) it therefore takes the DOM-only fast path
// (ɵɵdomElement*) — this is the pipe-only-@defer guard: it must NOT count the pipe
// used in the @defer block as a directive dependency. In LOCAL mode (golden.md) deps
// can't be inspected, so hasDirectiveDependencies is forced true and the FULL
// instruction set (ɵɵelement*) is emitted regardless.
// https://github.com/angular/angular/blob/e3ac727/packages/compiler/src/render3/view/compiler.ts#L201-L203
@Component({
  selector: 'app-root',
  template: `
    <div>
      @defer {
        {{ 'hello' | myPipe }}
      } @placeholder {
        Placeholder
      }
    </div>
  `,
  standalone: true,
  imports: [MyPipe]
})
class AppComponent {}
```
