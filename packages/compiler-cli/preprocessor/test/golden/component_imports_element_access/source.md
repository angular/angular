# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.component.ts", "list.ts", "a.component.ts", "b.directive.ts"]
}
```

# /a.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'a-cmp',
  standalone: true,
  template: 'a',
})
export class AComponent {}
```

# /b.directive.ts
```ts
import { Directive } from '@angular/core';

@Directive({
  selector: '[bDir]',
  standalone: true,
})
export class BDirective {}
```

# /list.ts
```ts
import { AComponent } from './a.component';
import { BDirective } from './b.directive';

export const LIST = [AComponent, BDirective];
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { LIST } from './list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LIST[0]],
  template: '<a-cmp></a-cmp><div bDir></div>',
})
export class AppComponent {}
```
