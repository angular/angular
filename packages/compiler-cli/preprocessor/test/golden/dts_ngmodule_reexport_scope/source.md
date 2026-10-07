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

# /node_modules/my-lib/package.json
```json
{
  "name": "my-lib",
  "types": "index.d.ts"
}
```

# /node_modules/my-lib/index.d.ts
```ts
export * from './fesm/lib';
```

# /node_modules/my-lib/fesm/lib.d.ts
```ts
import * as i0 from '@angular/core';

export declare class LibComponent {
  static ɵfac: i0.ɵɵFactoryDeclaration<LibComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<LibComponent, "lib-cmp", never, {}, {}, never, never, false, never>;
}

export declare class LibDirective {
  static ɵfac: i0.ɵɵFactoryDeclaration<LibDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<LibDirective, "[lib-dir]", never, {}, {}, never, never, false, never>;
}

export declare class LibModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<LibModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<LibModule, [typeof LibComponent, typeof LibDirective], never, [typeof LibComponent, typeof LibDirective]>;
  static ɵinj: i0.ɵɵInjectorDeclaration<LibModule>;
}
```

# /app.ts
```ts
import {Component} from '@angular/core';
import {LibModule} from 'my-lib';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LibModule],
  template: `
    <div lib-dir></div>
    <lib-cmp></lib-cmp>
  `
})
export class AppComponent {}
```
