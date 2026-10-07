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

# /node_modules/ns-lib/package.json
```json
{
  "name": "ns-lib",
  "types": "index.d.ts"
}
```

`export * as internal from './internal'` publishes exactly one binding, `internal`. Reading it
as a plain `export *` would claim `ns-lib` publishes `NsDirective` by that name, and emit an
`import {NsDirective} from 'ns-lib'` the package cannot satisfy. The directive is only reachable
relatively.

# /node_modules/ns-lib/index.d.ts
```ts
import * as i0 from '@angular/core';
import { NsDirective } from './internal';

export * as internal from './internal';

export declare class NsModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<NsModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<NsModule, never, never, [typeof NsDirective]>;
  static ɵinj: i0.ɵɵInjectorDeclaration<NsModule>;
}
```

# /node_modules/ns-lib/internal.d.ts
```ts
import * as i0 from '@angular/core';

export declare class NsDirective {
  static ɵfac: i0.ɵɵFactoryDeclaration<NsDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<NsDirective, "[ns-dir]", never, {}, {}, never, never, false, never>;
}
```

# /app.ts
```ts
import {Component, NgModule} from '@angular/core';
import {NsModule} from 'ns-lib';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `<div ns-dir></div>`,
})
export class AppComponent {}

@NgModule({
  declarations: [AppComponent],
  imports: [NsModule],
})
export class AppModule {}
```
