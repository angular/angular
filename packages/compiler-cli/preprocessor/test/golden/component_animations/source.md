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
import { Component, trigger } from '@angular/core';

const myAnimations = [trigger('spreadTrigger', [])];

@Component({
  selector: 'app-root',
  template: '<div @myTrigger @nestedTrigger @spreadTrigger></div>',
  standalone: true,
  animations: [
    trigger('myTrigger', []),
    [trigger('nestedTrigger', [])],
    ...myAnimations,
  ],
})
export class AppComponent {}

const variableAnimations = [trigger('varTrigger', [])];

@Component({
  selector: 'app-var',
  template: '<div @varTrigger></div>',
  standalone: true,
  animations: variableAnimations,
})
export class VarComponent {}

@Component({
  selector: 'app-bound-invalid',
  template: '<div [@myTrigger]="ctxValue" @invalidTrigger></div>',
  standalone: true,
  animations: [trigger('myTrigger', [])],
})
export class BoundAndInvalidComponent {
  ctxValue = 'someValue';
}

```

