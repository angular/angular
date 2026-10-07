# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "es2022",
    "module": "es2022",
    "moduleResolution": "node"
  },
  "files": ["ng_content_selectors_diagnostics.ts"]
}
```

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
  "files": ["ng_content_selectors_diagnostics.ts"]
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

export declare class HasContent {
  static ɵcmp: i0.ɵɵComponentDeclaration<
    HasContent,
    "has-content",
    never,
    {},
    {},
    never,
    ["div"],
    true,
    never
  >;
}
```

# /ng_content_selectors_diagnostics.ts
```ts
import { Component } from '@angular/core';
import { HasContent } from 'test-lib';

@Component({
  selector: 'my-app',
  imports: [HasContent],
  template: `
    <has-content>
      @if (show) {
        <div></div>
        <div></div>
      }
    </has-content>
  `,
  standalone: true,
})
export class MyApp {
  show = true;
}
```
