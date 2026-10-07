# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["shadow-widget.component.ts", "dynamic-standalone.directive.ts", "dynamic.pipe.ts"]
}
```

# /shadow-widget.component.ts
```ts
import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'widget',
  standalone: true,
  template: '<div>Shadow</div>',
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class ShadowWidgetComponent {}
```

# /dynamic-standalone.directive.ts
```ts
import { Directive } from '@angular/core';

declare function isStandalone(): boolean;

@Directive({
  selector: '[appDynamicStandalone]',
  standalone: isStandalone(),
})
export class DynamicStandaloneDirective {}
```

# /dynamic.pipe.ts
```ts
import { Pipe, PipeTransform } from '@angular/core';

declare function pipeName(): string;
declare function isPure(): boolean;

@Pipe({
  name: pipeName(),
  pure: isPure(),
})
export class DynamicPipe implements PipeTransform {
  transform(value: unknown): unknown {
    return value;
  }
}
```
