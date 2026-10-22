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

# /node_modules/star-cycle-lib/package.json
```json
{
  "name": "star-cycle-lib",
  "types": "index.d.ts"
}
```

The entry point's star leads into a two-file `export *` cycle. The walk has to terminate, and
cutting the cycle must not drop the names the cycle's files declare themselves: the directive is
still published by the entry point, so the consumer emits it against the package specifier.

# /node_modules/star-cycle-lib/index.d.ts
```ts
export * from './a';
```

# /node_modules/star-cycle-lib/a.d.ts
```ts
import * as i0 from '@angular/core';

export * from './b';

export declare class RealDirective {
  static ɵfac: i0.ɵɵFactoryDeclaration<RealDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<RealDirective, "[cycle-dir]", never, {}, {}, never, never, false, never>;
}

export declare class CycleModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<CycleModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<CycleModule, never, never, [typeof RealDirective]>;
  static ɵinj: i0.ɵɵInjectorDeclaration<CycleModule>;
}
```

# /node_modules/star-cycle-lib/b.d.ts
```ts
export * from './a';

export declare class UnrelatedHelper {
  helperMarker: string;
}
```

# /app.ts
```ts
import {Component, NgModule} from '@angular/core';
import {CycleModule} from 'star-cycle-lib';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `<div cycle-dir></div>`,
})
export class AppComponent {}

@NgModule({
  declarations: [AppComponent],
  imports: [CycleModule],
})
export class AppModule {}
```
