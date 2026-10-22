# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["a.ts", "b.ts", "c.ts", "d.ts", "module.ts"]
}
```

# /a.ts
```ts
import {Component} from '@angular/core';

@Component({
  selector: 'comp-a',
  template: '<comp-b></comp-b>',
  standalone: false,
})
export class CompA {}
```

# /b.ts
```ts
import {Component} from '@angular/core';

@Component({
  selector: 'comp-b',
  template: '<comp-a></comp-a>',
  standalone: false,
})
export class CompB {}
```

# /c.ts
```ts
import {Component} from '@angular/core';

@Component({
  selector: 'comp-c',
  template: '<comp-d></comp-d>',
  standalone: false,
})
export class CompC {}
```

# /d.ts
```ts
import {Component} from '@angular/core';
import type {CompC} from './c';

@Component({
  selector: 'comp-d',
  template: '<div>D</div>',
  standalone: false,
})
export class CompD {
  parent?: CompC;
}
```

# /module.ts
```ts
import {NgModule} from '@angular/core';
import {CompA} from './a';
import {CompB} from './b';
import {CompC} from './c';
import {CompD} from './d';

@NgModule({
  declarations: [CompA, CompB, CompC, CompD],
})
export class AppModule {}
```
