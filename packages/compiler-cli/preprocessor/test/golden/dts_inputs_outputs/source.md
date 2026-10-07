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
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestComponent,
    "test-cmp",
    never,
    {
      simple: "simple";
      alias: "alias";
      required: { alias: "requiredAlias", required: true };
      signal: { alias: "signalAlias", isSignal: true };
    },
    {
      simpleOutput: "simpleOutput";
      aliasedOutput: "aliasedOutputAlias";
    },
    never,
    never,
    true,
    never
  >;
}

export declare class TestDirective {
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    TestDirective,
    "[test-dir]",
    never,
    {
      dirInput: "dirInput";
      signal: { alias: "signalAlias", isSignal: true };
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
import { TestComponent, TestDirective } from 'test-lib';

@Component({
  selector: 'app-root',
  template: `
    <test-cmp 
      [simple]="'hello'" 
      [alias]="'world'" 
      [requiredAlias]="'backend'" 
      [signalAlias]="'sig'"
      (simpleOutput)="handle($event)"
      (aliasedOutputAlias)="handle($event)"
    ></test-cmp>
    <div test-dir [dirInput]="'test'" [signal]="'sig'"></div>
  `,
  standalone: true,
  imports: [TestComponent, TestDirective],
})
export class AppComponent {
  handle(e: any) {}
}
```
