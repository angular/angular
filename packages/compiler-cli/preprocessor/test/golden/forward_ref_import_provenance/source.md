# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["test.ts"]
}
```

# /test.ts
```ts
import { Component, Directive, Input, ViewChild, forwardRef as ngForwardRef } from '@angular/core';

// Not Angular's `forwardRef` -- it merely shares the name, so it must NOT be unwrapped.
function forwardRef<T>(fn: () => T): T {
  return fn();
}

@Component({
  selector: 'app-host',
  standalone: true,
  template: '',
  hostDirectives: [ngForwardRef(() => DepDirective)],
})
export class HostComponent {
  @ViewChild(ngForwardRef(() => DepDirective)) aliased!: DepDirective;
  @ViewChild(forwardRef(() => DepDirective)) notAngular!: DepDirective;
}

@Directive({ selector: '[dep]', standalone: true })
export class DepDirective {
  @Input() value!: string;
}
```
