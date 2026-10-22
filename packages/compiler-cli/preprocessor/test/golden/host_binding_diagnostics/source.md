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
  template: '<div>Hello</div>',
  host: {
    '(mouseover)': HANDLER,
  },
})
export class DynamicListenerComponent {}
```
