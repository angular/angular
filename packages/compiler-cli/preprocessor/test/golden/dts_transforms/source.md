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
  width: number;
  height: number;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestComponent,
    "test-cmp",
    never,
    {
      width: "width";
      height: "height";
    },
    {},
    never,
    never,
    true,
    never
  >;
  static ngAcceptInputType_width: string | number;
  static ngAcceptInputType_height: string | number;
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
      width="100" 
      height="200"
    ></test-cmp>
  `,
  standalone: true,
  imports: [TestComponent],
})
export class AppComponent {
}
```
