# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "es2022",
    "module": "es2022",
    "moduleResolution": "node"
  },
  "files": ["app.ts"]
}
```

# /directives.d.ts
```ts
import * as i0 from '@angular/core';

export declare class DirA {
  static ɵfac: i0.ɵɵFactoryDeclaration<DirA, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<DirA, "[dirA]", never, {}, {}, never, never, true>;
}

export declare class DirB {
  static ɵfac: i0.ɵɵFactoryDeclaration<DirB, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<DirB, "[dirB]", never, {}, {}, never, never, true>;
}

export declare const READONLY_DEPS: readonly [typeof DirA, typeof DirB];
```

# /app.ts
```ts
import {Component} from '@angular/core';
import {READONLY_DEPS, DirA, DirB} from './directives';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [...READONLY_DEPS],
  template: '<div dirA dirB><h1>Hello</h1></div>',
})
export class AppComponent {}
```
