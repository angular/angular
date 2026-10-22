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
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'on-push-cmp',
  template: '<div>On Push Component</div>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnPushCmp {}

@Component({
  selector: 'default-cmp',
  template: '<div>Default Component</div>',
  changeDetection: ChangeDetectionStrategy.Default
})
export class DefaultCmp {}

@Component({
  selector: 'eager-cmp',
  template: '<div>Eager Component</div>',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class EagerCmp {}

// No `changeDetection` at all: the field must be omitted, not defaulted to a
// literal. Emitting it here would diverge from ngc for the most common shape.
@Component({
  selector: 'omitted-cmp',
  template: '<div>Omitted Component</div>'
})
export class OmittedCmp {}
```
