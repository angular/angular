# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.ts"]
}
```

# /app.ts
```typescript
import {Component, Input, input, booleanAttribute} from '@angular/core';

@Component({
  selector: 'test-coerced',
  standalone: true,
  template: `<div></div>`,
})
export class TestCoercedComponent {
  /** Should be coerced because of ngAcceptInputType_ */
  @Input() coercedByStatic!: string;
  static ngAcceptInputType_coercedByStatic: string | boolean;

  /** Should be coerced because of transform */
  @Input({transform: (v: string | null) => v || 'default'}) coercedByTransform!: string;

  /** Should be restricted because of private */
  @Input() private privateInput!: string;

  /** Should be restricted because of protected */
  @Input() protected protectedInput!: string;

  /** Should be restricted because of readonly */
  @Input() readonly readonlyInput!: string;

  /** Should be string literal because of string literal key */
  @Input() 'literalInput'!: string;
  
  /** Signal input with transform - should be coerced */
  signalWithTransform = input(false, {transform: booleanAttribute});

  // Testing a normal input that is just normal
  @Input() normalInput!: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TestCoercedComponent],
  template: `
    <test-coerced
      [coercedByStatic]="'test'"
      [coercedByTransform]="'test'"
      [privateInput]="'test'"
      [protectedInput]="'test'"
      [readonlyInput]="'test'"
      [literalInput]="'test'"
      [signalWithTransform]="'test'"
      [normalInput]="'test'"
    ></test-coerced>
  `
})
export class AppComponent {}
```
