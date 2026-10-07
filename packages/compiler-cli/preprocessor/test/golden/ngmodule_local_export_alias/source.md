# /tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@angular/material/legacy-core": ["./node_modules/@angular/material/legacy-core/index.d.ts"]
    }
  },
  "files": ["app.component.ts"]
}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { MatLegacyRippleModule } from '@angular/material/legacy-core';
import { AliasedLocalModule } from './local_alias';

@Component({
  selector: 'app-root',
  standalone: true,
  template: '<div mat-ripple local-dir></div>',
  imports: [MatLegacyRippleModule, AliasedLocalModule],
})
export class AppComponent {}
```

# /local_alias.ts
```ts
import { InternalLocalModule } from './internal_module';

export { InternalLocalModule as AliasedLocalModule };
```

# /internal_module.ts
```ts
import { NgModule } from '@angular/core';
import { LocalDir } from './local_dir';

@NgModule({
  declarations: [LocalDir],
  exports: [LocalDir],
})
export class InternalLocalModule {}
```

# /local_dir.ts
```ts
import { Directive } from '@angular/core';

@Directive({
  selector: '[local-dir]',
})
export class LocalDir {}
```

# /node_modules/@angular/material/legacy-core/index.d.ts
```ts
import { MatRippleModule, MatRipple } from './ripple';

export { MatRippleModule as MatLegacyRippleModule, MatRipple };
```

# /node_modules/@angular/material/legacy-core/ripple.d.ts
```ts
import { Directive, NgModule } from '@angular/core';
import * as i0 from '@angular/core';

export declare class MatRipple {
  static ɵfac: i0.ɵɵFactoryDeclaration<MatRipple, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    MatRipple,
    '[mat-ripple]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  >;
}

export declare class MatRippleModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<MatRippleModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    MatRippleModule,
    [typeof MatRipple],
    never,
    [typeof MatRipple]
  >;
  static ɵinj: i0.ɵɵInjectorDeclaration<MatRippleModule>;
}
```
