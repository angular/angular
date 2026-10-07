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

# /node_modules/double-rename-lib/package.json
```json
{
  "name": "double-rename-lib",
  "types": "index.d.ts"
}
```

The declaration is renamed twice on its way out: `Real` becomes `Inner` in the middle file and
`Outer` at the entry point. Each hop's re-export names the *previous* hop's exported name, so
matching either rename against the declared name finds nothing — the chain has to be followed
hop by hop, and the consumer can only write the entry point's final name, `Outer`.

# /node_modules/double-rename-lib/index.d.ts
```ts
import * as i0 from '@angular/core';
import { Real } from './impl';

export { Inner as Outer } from './mid';

export declare class RenameModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<RenameModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<RenameModule, never, never, [typeof Real]>;
  static ɵinj: i0.ɵɵInjectorDeclaration<RenameModule>;
}
```

# /node_modules/double-rename-lib/mid.d.ts
```ts
export { Real as Inner } from './impl';
```

# /node_modules/double-rename-lib/impl.d.ts
```ts
import * as i0 from '@angular/core';

export declare class Real {
  static ɵfac: i0.ɵɵFactoryDeclaration<Real, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<Real, "[double-renamed-dir]", never, {}, {}, never, never, false, never>;
}
```

# /app.ts
```ts
import {Component, NgModule} from '@angular/core';
import {RenameModule} from 'double-rename-lib';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `<div double-renamed-dir></div>`,
})
export class AppComponent {}

@NgModule({
  declarations: [AppComponent],
  imports: [RenameModule],
})
export class AppModule {}
```
