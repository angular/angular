# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": true,
    "moduleResolution": "node",
    "target": "es2022",
    "lib": ["es2022", "dom"]
  },
  "files": ["app.module.ts", "app.component.ts", "store.ts"]
}
```

# /node_modules/@ngrx/store/package.json
```json
{
  "name": "@ngrx/store",
  "types": "index.d.ts"
}
```

# /node_modules/@ngrx/store/index.d.ts
```ts
import * as i0 from "@angular/core";
import { ModuleWithProviders } from "@angular/core";

export declare class StoreFeatureModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<StoreFeatureModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<StoreFeatureModule, never, never, never>;
  static ɵinj: i0.ɵɵInjectorDeclaration<StoreFeatureModule>;
}

export declare class StoreModule {
  static forFeature(featureName: string, reducer: any): ModuleWithProviders<StoreFeatureModule>;
  static ɵfac: i0.ɵɵFactoryDeclaration<StoreModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<StoreModule, never, never, never>;
  static ɵinj: i0.ɵɵInjectorDeclaration<StoreModule>;
}

export declare class ActionsSubject {
  static ɵfac: i0.ɵɵFactoryDeclaration<ActionsSubject, never>;
  static ɵprov: i0.ɵɵInjectableDeclaration<ActionsSubject>;
}
```

# /store.ts
```ts
import { StoreModule } from '@ngrx/store';

export const featureStoreModule = StoreModule.forFeature('my-feature', {});
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { ActionsSubject } from '@ngrx/store';

@Component({
  selector: 'app-root',
  template: '<div>Root</div>',
  standalone: false,
})
export class AppComponent {
  constructor(private actions$: ActionsSubject) {}
}
```

# /app.module.ts
```ts
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { featureStoreModule } from './store';

@NgModule({
  declarations: [AppComponent],
  imports: [
    featureStoreModule,
  ],
})
export class AppModule {}
```
