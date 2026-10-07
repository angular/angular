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
      "@shared": ["./shared/index.ts"]
    }
  },
  "files": ["a/a.module.ts", "a/a.component.ts", "shared/index.ts"]
}
```

# /shared/index.ts
```ts
export * from './routes';
export * from './shared.module';
export * from './b.component';
```

# /shared/routes.ts
```ts
import { A } from '../a/a.component';

export const ROUTES = [{ path: '', component: A }];
```

# /shared/shared.module.ts
```ts
import { NgModule } from '@angular/core';
import { B } from './b.component';

@NgModule({
  declarations: [B],
  exports: [B],
})
export class SharedModule {}
```

# /shared/b.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'b-cmp',
  template: 'b',
  standalone: false,
})
export class B {}
```

# /a/a.module.ts
```ts
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { A } from './a.component';

@NgModule({
  declarations: [A],
  imports: [SharedModule],
})
export class AModule {}
```

# /a/a.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'a-cmp',
  template: '<b-cmp></b-cmp>',
  standalone: false,
})
export class A {}
```
