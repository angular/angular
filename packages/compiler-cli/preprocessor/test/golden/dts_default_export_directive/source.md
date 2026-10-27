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

# /node_modules/default-lib/package.json
```json
{
  "name": "default-lib",
  "types": "index.d.ts"
}
```

`analyze_dts` used to skip `export default` entirely, so `DefaultDirective` was never registered
and `DefaultModule`'s scope came back empty — the directive silently dropped out of the
template's scope rather than merely losing its specifier.

# /node_modules/default-lib/index.d.ts
```ts
import * as i0 from '@angular/core';

export default class DefaultDirective {
  static ɵfac: i0.ɵɵFactoryDeclaration<DefaultDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<DefaultDirective, "[default-dir]", never, {}, {}, never, never, false, never>;
}

export declare class DefaultModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<DefaultModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<DefaultModule, never, never, [typeof DefaultDirective]>;
  static ɵinj: i0.ɵɵInjectorDeclaration<DefaultModule>;
}
```

# /app.ts
```ts
import {Component, NgModule} from '@angular/core';
import {DefaultModule} from 'default-lib';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `<div default-dir></div>`,
})
export class AppComponent {}

@NgModule({
  declarations: [AppComponent],
  imports: [DefaultModule],
})
export class AppModule {}
```
