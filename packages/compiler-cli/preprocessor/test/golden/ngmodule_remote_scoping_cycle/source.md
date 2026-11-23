# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.module.ts", "comp-a.component.ts", "comp-b.component.ts"]
}
```

# /app.module.ts
```ts
import { NgModule } from '@angular/core';
import { CompA } from './comp-a.component';
import { CompB } from './comp-b.component';

@NgModule({
  declarations: [CompA, CompB],
  exports: [CompA, CompB],
})
export class AppModule {}
```

# /comp-a.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'comp-a',
  template: '<div>CompA: <comp-b></comp-b></div>',
  standalone: false,
})
export class CompA {}
```

# /comp-b.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'comp-b',
  template: '<div>CompB: <comp-a></comp-a></div>',
  standalone: false,
})
export class CompB {}
```
