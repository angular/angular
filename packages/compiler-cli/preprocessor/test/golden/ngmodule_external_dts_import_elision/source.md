# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@angular/core": ["node_modules/@angular/core/index.d.ts"],
      "@angular/cdk/drag-drop": ["node_modules/@angular/cdk/drag-drop/index.d.ts"]
    }
  },
  "files": [
    "node_modules/@angular/core/index.d.ts",
    "node_modules/@angular/cdk/drag-drop/index.d.ts",
    "node_modules/@angular/cdk/drag-drop/scrollable.d.ts",
    "node_modules/@angular/cdk/drag-drop/drag-drop-module.d.ts",
    "minimap.ts"
  ]
}
```

# /node_modules/@angular/cdk/drag-drop/index.d.ts
```ts
export * from './scrollable';
export * from './drag-drop-module';
```

# /node_modules/@angular/cdk/drag-drop/scrollable.d.ts
```ts
import * as i0 from '@angular/core';

export declare class CdkScrollable {
  static ɵdir: i0.ɵɵDirectiveDeclaration<CdkScrollable, '[cdkScrollable]', never, {}, {}, never, never, false, never>;
}
```

# /node_modules/@angular/cdk/drag-drop/drag-drop-module.d.ts
```ts
import * as i0 from '@angular/core';
import * as i1 from './scrollable';

export declare class DragDropModule {
  static ɵmod: i0.ɵɵNgModuleDeclaration<DragDropModule, [typeof i1.CdkScrollable], never, [typeof i1.CdkScrollable]>;
  static ɵinj: i0.ɵɵInjectorDeclaration<DragDropModule>;
}
```

# /minimap.ts
```ts
import { Component, NgModule } from '@angular/core';
import { CdkScrollable, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'dummy-cmp',
  standalone: true,
  imports: [CdkScrollable],
  template: '<div>Dummy</div>',
})
export class DummyComponent {}

@Component({
  selector: 'app-root',
  standalone: false,
  template: '<div>Hello</div>',
})
export class AppComponent {}

@NgModule({
  imports: [DragDropModule],
  declarations: [AppComponent],
})
export class TestModule {}
```
