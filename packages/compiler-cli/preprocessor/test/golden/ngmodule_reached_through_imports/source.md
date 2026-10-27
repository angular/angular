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
  "files": ["main.ts"],
  "angularCompilerOptions": {}
}
```

# /main.ts
```ts
import {MModule} from './m.module';

export const root = MModule;
```

# /m.module.ts
```ts
import {NgModule} from '@angular/core';
import {C1} from './c1.component';
import {C2} from './c2.component';
import {D} from './d.directive';

@NgModule({declarations: [C1, C2, D]})
export class MModule {}
```

# /c1.component.ts
```ts
import {Component} from '@angular/core';

@Component({selector: 'c1', template: '<div d></div>', standalone: false})
export class C1 {}
```

# /c2.component.ts
```ts
import {Component} from '@angular/core';

@Component({selector: 'c2', template: '<span d></span>', standalone: false})
export class C2 {}
```

# /d.directive.ts
```ts
import {Directive} from '@angular/core';

@Directive({selector: '[d]', standalone: false})
export class D {}
```
