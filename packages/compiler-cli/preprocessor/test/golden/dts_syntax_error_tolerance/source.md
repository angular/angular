# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "es2022",
    "module": "es2022",
    "moduleResolution": "node"
  },
  "files": ["app.ts", "broken.d.ts"]
}
```

# /broken.d.ts
```ts
import * as i0 from '@angular/core';

export declare interface BrokenType {
  '
': boolean;
  '
': boolean;
}

export declare class BrokenDtsDirective {
  brokenInput: string;
  static ɵfac: i0.ɵɵFactoryDeclaration<BrokenDtsDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    BrokenDtsDirective,
    "[broken-dir]",
    ["brokenDir"],
    { "brokenInput": { "alias": "brokenInput"; "required": false; }; },
    {},
    never,
    never,
    true
  >;
}
```

# /app.ts
```ts
import { Component } from '@angular/core';
import { BrokenType, BrokenDtsDirective } from './broken';

@Component({
  selector: 'app-comp',
  template: '<div broken-dir [brokenInput]="\'test\'">DTS Tolerance</div>',
  imports: [BrokenDtsDirective],
  standalone: true,
})
export class AppComp {
  item?: BrokenType;
}
```
