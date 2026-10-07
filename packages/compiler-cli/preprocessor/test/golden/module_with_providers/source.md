# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "es2022",
    "module": "es2022",
    "moduleResolution": "node"
  },
  "files": ["lib.d.ts", "local.ts", "app.module.ts", "app.component.ts"]
}
```

# /lib.d.ts
```ts
import * as i0 from '@angular/core';
import { ModuleWithProviders } from '@angular/core';

export declare class ForeignDirective {
  static ɵfac: i0.ɵɵFactoryDeclaration<ForeignDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<ForeignDirective, "[foreign-dir]", never, {}, {}, never, never, false, never>;
}

export declare class ForeignModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<ForeignModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<ForeignModule, [typeof ForeignDirective], never, [typeof ForeignDirective]>;
  static ɵinj: i0.ɵɵInjectorDeclaration<ForeignModule>;
  static forRoot(): ModuleWithProviders<ForeignModule>;
}
```

# /local.ts
```ts
import { NgModule } from '@angular/core';

@NgModule({})
export class ModA {}

@NgModule({})
export class ModB {}

@NgModule({})
export class ModC {}

@NgModule({})
export class ModD {}

@NgModule({})
export class ModE {}

export function provideB() {
  return { ngModule: ModB, providers: [] };
}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<div foreign-dir></div>',
  standalone: false,
})
export class AppComponent {}
```

# /app.module.ts
```ts
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { ForeignModule } from './lib';
import { ModA, ModC, ModD, ModE, provideB } from './local';

@NgModule({
  declarations: [AppComponent],
  imports: [ForeignModule.forRoot(), ModA, provideB(), [ModC, ModD]],
  exports: [ModE],
})
export class AppModule {}
```
