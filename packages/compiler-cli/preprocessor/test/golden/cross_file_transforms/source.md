# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.ts"]
}
```

# /transforms.ts
```typescript
export function myBooleanTransform(value: string | boolean): boolean {
    return value === '' || value === true || value === 'true';
}

export const arrowTransform = (val: number | string) => val;

export type ExternalToNumberType = number | string | boolean;
export function externalToNumberTransform(value: ExternalToNumberType): number {
    return Number(value);
}
```

# /app.ts
```typescript
import {Component, Input, input} from '@angular/core';
import {myBooleanTransform, externalToNumberTransform} from './transforms';
import {arrowTransform as aliasedTransform} from './transforms';

@Component({
  selector: 'test-transforms',
  standalone: true,
  template: `<div></div>`,
})
export class TestTransformsComponent {
  @Input({transform: myBooleanTransform}) decoratorInput!: boolean;
  @Input({transform: aliasedTransform}) aliasedInput!: unknown;

  signalInput = input(false, {transform: myBooleanTransform});
  aliasedSignal = input(0, {transform: aliasedTransform});

  // Also test a regular inline transform
  @Input({transform: (v: string | null) => v || 'default'}) inlineTransform!: string;

  // Test automatic import resolution for the external type
  @Input({transform: externalToNumberTransform}) externalTypeInput!: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TestTransformsComponent],
  template: `
    <test-transforms
      [decoratorInput]="'true'"
      [aliasedInput]="123"
      [signalInput]="'false'"
      [aliasedSignal]="'hello'"
      [inlineTransform]="null"
      [externalTypeInput]="true"
    ></test-transforms>
  `
})
export class AppComponent {}
```
