# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["highlight.directive.ts", "generic.directive.ts"]
}
```

# /highlight.directive.ts
```ts
import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
})
export class HighlightDirective {
  constructor(private el: ElementRef) {
    this.el.nativeElement.style.backgroundColor = 'yellow';
  }
}
```

# /generic.directive.ts
```ts
import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[appGeneric]',
})
export class GenericDirective<T> {
  @Input() value: T | null = null;
}
```
