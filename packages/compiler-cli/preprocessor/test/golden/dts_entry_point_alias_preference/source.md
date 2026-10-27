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

# /node_modules/alias-lib/package.json
```json
{
  "name": "alias-lib",
  "types": "index.d.ts"
}
```

`alias-lib` publishes `AliasedDirective` twice: once under a private VE-style alias, once under
its declared name through a barrel. Upstream prefers the export whose name matches the declared
name, so the emit has to say `AliasedDirective` even though the alias is the first export the
entry point lists.

# /node_modules/alias-lib/index.d.ts
```ts
import * as i0 from '@angular/core';
import { AliasedDirective } from './inner';

export { AliasedDirective as ɵangular_packages_alias_lib_a } from './inner';
export * from './inner';

export declare class AliasModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<AliasModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<AliasModule, never, never, [typeof AliasedDirective]>;
  static ɵinj: i0.ɵɵInjectorDeclaration<AliasModule>;
}
```

# /node_modules/alias-lib/inner.d.ts
```ts
import * as i0 from '@angular/core';

export declare class AliasedDirective {
  static ɵfac: i0.ɵɵFactoryDeclaration<AliasedDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<AliasedDirective, "[alias-dir]", never, {}, {}, never, never, false, never>;
}
```

# /app.ts
```ts
import {Component, NgModule} from '@angular/core';
import {AliasModule} from 'alias-lib';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `<div alias-dir></div>`,
})
export class AppComponent {}

@NgModule({
  declarations: [AppComponent],
  imports: [AliasModule],
})
export class AppModule {}
```
