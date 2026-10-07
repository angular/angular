# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["bad-expression.directive.ts", "dynamic-listener.component.ts"]
}
```

# /bad-expression.directive.ts
```ts
import { Directive } from '@angular/core';

@Directive({
  selector: '[appBadExpression]',
  standalone: true,
  host: {
    '[attr.role]': "'button'",
    '(click)': 'handle((',
  },
})
export class BadExpressionDirective {
  handle() {}
}
```

# /dynamic-listener.component.ts
```ts
import { Component } from '@angular/core';

const HANDLER = () => {};

@Component({
  selector: 'app-dynamic-listener',
  standalone: true,
  template: '<div>Hello</div>',
  host: {
    '(mouseover)': HANDLER,
  },
})
export class DynamicListenerComponent {}
```
