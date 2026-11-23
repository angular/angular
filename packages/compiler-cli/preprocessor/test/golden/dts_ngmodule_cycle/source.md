# /tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "node",
    "strict": true
  },
  "files": ["main.ts"]
}
```

# /node_modules/lib/index.d.ts
```typescript
import { ModuleA } from './module_a';
import { ModuleB } from './module_b';
export { ModuleA, ModuleB };
```

# /node_modules/lib/module_a.d.ts
```typescript
import { ModuleB } from './module_b';
import * as i0 from "@angular/core";
export declare class ModuleA {
    static ɵmod: i0.ɵɵNgModuleDeclaration<ModuleA, never, [typeof ModuleB], [typeof ModuleB]>;
}
```

# /node_modules/lib/module_b.d.ts
```typescript
import { ModuleA } from './module_a';
import * as i0 from "@angular/core";
export declare class ModuleB {
    static ɵmod: i0.ɵɵNgModuleDeclaration<ModuleB, never, [typeof ModuleA], [typeof ModuleA]>;
}
```

# /main.ts
```typescript
import { Component, NgModule } from '@angular/core';
import { ModuleA } from 'lib';

@Component({
  selector: 'app-root',
  template: 'hello',
  standalone: false
})
export class AppComponent {}

@NgModule({
  declarations: [AppComponent],
  imports: [ModuleA]
})
export class AppModule {}
```
