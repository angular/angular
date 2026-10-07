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

# /node_modules/star-shadow-lib/package.json
```json
{
  "name": "star-shadow-lib",
  "types": "index.d.ts"
}
```

The module's `typeof SharedDirective` reference is chased through a barrel whose first star is
`export type *`, and the file behind it declares an identically named, undecorated class. A value
chase that crosses the type-only star resolves that shadow instead of the directive behind the
value star, and the module's scope silently loses the directive.

# /node_modules/star-shadow-lib/index.d.ts
```ts
import * as i0 from '@angular/core';
import { SharedDirective } from './barrel';

export * from './barrel';

export declare class SharedModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<SharedModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<SharedModule, never, never, [typeof SharedDirective]>;
  static ɵinj: i0.ɵɵInjectorDeclaration<SharedModule>;
}
```

# /node_modules/star-shadow-lib/barrel.d.ts
```ts
export type * from './shadow';
export * from './real';
```

# /node_modules/star-shadow-lib/shadow.d.ts
```ts
export declare class SharedDirective {
  shadowMarker: string;
}
```

# /node_modules/star-shadow-lib/real.d.ts
```ts
import * as i0 from '@angular/core';

export declare class SharedDirective {
  static ɵfac: i0.ɵɵFactoryDeclaration<SharedDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<SharedDirective, "[shared-dir]", never, {}, {}, never, never, false, never>;
}
```

# /app.ts
```ts
import {Component, NgModule} from '@angular/core';
import {SharedModule} from 'star-shadow-lib';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `<div shared-dir></div>`,
})
export class AppComponent {}

@NgModule({
  declarations: [AppComponent],
  imports: [SharedModule],
})
export class AppModule {}
```
