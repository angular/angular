# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": true,
    "moduleResolution": "node",
    "target": "es2022",
    "lib": ["es2022", "dom"]
  },
  "files": ["app.component.ts"]
}
```

# /node_modules/test-lib/package.json
```json
{
  "name": "test-lib",
  "types": "index.d.ts"
}
```

# /node_modules/test-lib/index.d.ts
```ts
import * as i0 from "@angular/core";

export declare class TestComponent {
  private privateInput: string;
  protected protectedInput: string;
  readonly readonlyInput: string;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestComponent,
    "test-cmp",
    never,
    {
      privateInput: "privateInput";
      protectedInput: "protectedInput";
      readonlyInput: "readonlyInput";
    },
    {},
    never,
    never,
    true,
    never
  >;
}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { TestComponent } from 'test-lib';

@Component({
  selector: 'app-root',
  template: `
    <test-cmp 
      [privateInput]="'val1'" 
      [protectedInput]="'val2'" 
      [readonlyInput]="'val3'"
    ></test-cmp>
  `,
  standalone: true,
  imports: [TestComponent],
})
export class AppComponent {}
```
