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

# /node_modules/type-lib/package.json
```json
{
  "name": "type-lib",
  "types": "index.d.ts"
}
```

`export type { … }` and `export { type … }` publish a name that exists only in type position.
Emitting `i1.TypeOnlyDirective` against one puts it in a value position, which fails the
consumer's `tsc`, so the specifier is declined and the declaration is reached relatively.

# /node_modules/type-lib/index.d.ts
```ts
import * as i0 from '@angular/core';
import { TypeOnlyDirective, StarDirective } from './internal';

export type { TypeOnlyDirective } from './internal';
export type * from './starred';

export declare class TypeOnlyModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<TypeOnlyModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<TypeOnlyModule, never, never, [typeof TypeOnlyDirective, typeof StarDirective]>;
  static ɵinj: i0.ɵɵInjectorDeclaration<TypeOnlyModule>;
}
```

# /node_modules/type-lib/internal.d.ts
```ts
import * as i0 from '@angular/core';

export declare class TypeOnlyDirective {
  static ɵfac: i0.ɵɵFactoryDeclaration<TypeOnlyDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<TypeOnlyDirective, "[type-only-dir]", never, {}, {}, never, never, false, never>;
}

export declare class StarDirective {
  static ɵfac: i0.ɵɵFactoryDeclaration<StarDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<StarDirective, "[star-dir]", never, {}, {}, never, never, false, never>;
}
```

# /node_modules/type-lib/starred.d.ts
```ts
export { StarDirective } from './internal';
```

# /app.ts
```ts
import {Component, NgModule} from '@angular/core';
import {TypeOnlyModule} from 'type-lib';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `<div type-only-dir star-dir></div>`,
})
export class AppComponent {}

@NgModule({
  declarations: [AppComponent],
  imports: [TypeOnlyModule],
})
export class AppModule {}
```
