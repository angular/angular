# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["z_first.ts", "a_second.ts", "module.ts"]
}
```

# /z_first.ts
```ts
import {Component} from '@angular/core';

@Component({
  selector: 'z-first',
  template: '<a-second></a-second>',
  standalone: false,
})
export class ZFirstComp {}
```

# /a_second.ts
```ts
import {Component} from '@angular/core';

@Component({
  selector: 'a-second',
  template: '<z-first></z-first>',
  standalone: false,
})
export class ASecondComp {}
```

# /module.ts
```ts
import {NgModule} from '@angular/core';
import {ZFirstComp} from './z_first';
import {ASecondComp} from './a_second';

@NgModule({
  declarations: [ZFirstComp, ASecondComp],
})
export class AppModule {}
```
