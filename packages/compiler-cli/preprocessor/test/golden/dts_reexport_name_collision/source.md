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

# /node_modules/collide-lib/package.json
```json
{
  "name": "collide-lib",
  "types": "index.d.ts"
}
```

Two different declarations are named `CollideDirective`, and the one `collide-lib` publishes is
not the one `CollideModule` exports. A re-export matched by name is proof of nothing: it says
the entry point publishes *a* `CollideDirective`, not *this* one, so accepting it emits
`i1.CollideDirective` — a real member of the package, bound to the wrong directive.

# /node_modules/collide-lib/index.d.ts
```ts
import * as i0 from '@angular/core';
import { CollideDirective } from './internal';

export { CollideDirective } from './public';

export declare class CollideModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<CollideModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<CollideModule, never, never, [typeof CollideDirective]>;
  static ɵinj: i0.ɵɵInjectorDeclaration<CollideModule>;
}
```

# /node_modules/collide-lib/public.d.ts
```ts
import * as i0 from '@angular/core';

export declare class CollideDirective {
  static ɵfac: i0.ɵɵFactoryDeclaration<CollideDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<CollideDirective, "[public-collide]", never, {}, {}, never, never, false, never>;
}
```

# /node_modules/collide-lib/internal.d.ts
```ts
import * as i0 from '@angular/core';

export declare class CollideDirective {
  static ɵfac: i0.ɵɵFactoryDeclaration<CollideDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<CollideDirective, "[internal-collide]", never, {}, {}, never, never, false, never>;
}
```

# /app.ts
```ts
import {Component, NgModule} from '@angular/core';
import {CollideModule} from 'collide-lib';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `<div internal-collide></div>`,
})
export class AppComponent {}

@NgModule({
  declarations: [AppComponent],
  imports: [CollideModule],
})
export class AppModule {}
```
