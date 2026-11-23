# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "declaration": true,
    "emitDeclarationOnly": true
  },
  "angularCompilerOptions": {
    "_experimentalAllowEmitDeclarationOnly": true,
    "generateExtraImportsInLocalMode": true
  },
  "files": ["child.ts", "comp.ts", "module.ts"]
}
```

# /child.ts
```ts
import {Component} from '@angular/core';

@Component({
  selector: 'child-comp',
  template: '',
  standalone: false,
})
export class ChildComp {}
```

# /comp.ts
```ts
import {Component} from '@angular/core';

@Component({
  selector: 'my-comp',
  template: '<child-comp></child-comp>',
  standalone: false,
})
export class MyComp {}
```

# /module.ts
```ts
import {NgModule} from '@angular/core';
import {ChildComp} from './child';
import {MyComp} from './comp';

@NgModule({
  declarations: [ChildComp, MyComp],
})
export class AppModule {}
```
