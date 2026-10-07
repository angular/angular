# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["parent.component.ts", "hello.component.ts", "highlight.directive.ts", "upcase.pipe.ts"]
}
```

# /hello.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-hello',
  template: '<span>Hello</span>',
  standalone: true,
})
export class HelloComponent {}
```

# /highlight.directive.ts
```ts
import { Directive } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective {}
```

# /upcase.pipe.ts
```ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'upcase',
  standalone: true,
})
export class UpcasePipe implements PipeTransform {
  transform(value: string): string {
    return value.toUpperCase();
  }
}
```

# /parent.component.ts
```ts
import { Component } from '@angular/core';
import { HelloComponent } from './hello.component';
import { HighlightDirective } from './highlight.directive';
import { UpcasePipe } from './upcase.pipe';

@Component({
  selector: 'app-parent',
  template: '<app-hello appHighlight>{{ "test" | upcase }}</app-hello>',
  standalone: true,
  imports: [HelloComponent, HighlightDirective, UpcasePipe],
})
export class ParentComponent {}

import { forwardRef } from '@angular/core';

@Component({
  selector: 'test-forward-ref',
  standalone: true,
  imports: [forwardRef(() => ForwardRefTargetComponent)],
  template: '<app-forward-ref-target></app-forward-ref-target>',
})
export class ForwardRefComponent {}

@Component({
  selector: 'app-forward-ref-target',
  standalone: true,
  template: '<span>Target</span>',
})
export class ForwardRefTargetComponent {}
```
