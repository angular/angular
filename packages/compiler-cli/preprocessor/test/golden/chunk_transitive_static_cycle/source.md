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
  "files": [
    "a.component.ts",
    "b.component.ts",
    "c.component.ts",
    "app.module.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /a.component.ts
```ts
import {Component} from '@angular/core';

export const CONST_A = 'data-from-a';

@Component({
  selector: 'comp-a',
  template: '<comp-b></comp-b>',
  standalone: false,
})
export class CompA {}
```

# /b.component.ts
```ts
import {Component} from '@angular/core';

@Component({
  selector: 'comp-b',
  template: '<comp-c></comp-c>',
  standalone: false,
})
export class CompB {}
```

# /c.component.ts
```ts
import {Component} from '@angular/core';
import {CONST_A} from './a.component';

@Component({
  selector: 'comp-c',
  template: '<div>{{ val }}</div>',
  standalone: false,
})
export class CompC {
  val = CONST_A;
}
```

# /app.module.ts
```ts
import {NgModule} from '@angular/core';
import {CompA} from './a.component';
import {CompB} from './b.component';
import {CompC} from './c.component';

@NgModule({
  declarations: [CompA, CompB, CompC],
  exports: [CompA, CompB, CompC],
})
export class AppModule {}
```
