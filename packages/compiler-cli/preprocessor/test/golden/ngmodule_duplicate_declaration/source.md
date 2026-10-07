# /tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "esnext",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": false,
    "moduleResolution": "node"
  },
  "files": ["m1.module.ts", "m2.module.ts", "c.component.ts", "d.directive.ts"],
  "angularCompilerOptions": {}
}
```

# /m1.module.ts
```ts
import {NgModule} from '@angular/core';
import {C} from './c.component';
import {D} from './d.directive';

@NgModule({declarations: [C, D]})
export class M1Module {}
```

# /m2.module.ts
```ts
import {NgModule} from '@angular/core';
import {C} from './c.component';
import {D} from './d.directive';

@NgModule({declarations: [C, D]})
export class M2Module {}
```

# /c.component.ts
```ts
import {Component} from '@angular/core';

export const LABEL = 'c';

@Component({selector: 'c', template: '<div d></div>', standalone: false})
export class C {}
```

# /d.directive.ts
```ts
import {Directive} from '@angular/core';
import {LABEL} from './c.component';

@Directive({selector: '[d]', standalone: false})
export class D {
  l = LABEL;
}
```
