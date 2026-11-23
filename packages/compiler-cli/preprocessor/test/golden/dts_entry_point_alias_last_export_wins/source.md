# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": true,
    "moduleResolution": "node",
    "target": "es2022",
    "module": "es2022",
    "lib": ["es2022", "dom"]
  },
  "files": ["app.ts"]
}
```

# /node_modules/last-lib/package.json
```json
{
  "name": "last-lib",
  "types": "index.d.ts"
}
```

Three aliases and no export under the declared name, so the preference for the declared name
cannot break the tie. Upstream's export map is built by overwriting, and only an entry already
holding the declared name survives a later one — so the last export enumerated wins.
Enumeration follows source order, not name order: the aliases are declared in reverse
alphabetical order, so the positionally last (`ɵa`) must win over the alphabetically last (`ɵc`).

# /node_modules/last-lib/index.d.ts
```ts
import * as i0 from '@angular/core';
import { HiddenDirective } from './inner';

export { HiddenDirective as ɵc } from './inner';
export { HiddenDirective as ɵb } from './inner';
export { HiddenDirective as ɵa } from './inner';

export declare class HiddenModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<HiddenModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<HiddenModule, never, never, [typeof HiddenDirective]>;
  static ɵinj: i0.ɵɵInjectorDeclaration<HiddenModule>;
}
```

# /node_modules/last-lib/inner.d.ts
```ts
import * as i0 from '@angular/core';

export declare class HiddenDirective {
  static ɵfac: i0.ɵɵFactoryDeclaration<HiddenDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<HiddenDirective, "[hidden-dir]", never, {}, {}, never, never, false, never>;
}
```

# /app.ts
```ts
import {Component, NgModule} from '@angular/core';
import {HiddenModule} from 'last-lib';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `<div hidden-dir></div>`,
})
export class AppComponent {}

@NgModule({
  declarations: [AppComponent],
  imports: [HiddenModule],
})
export class AppModule {}
```
