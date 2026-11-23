# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["src/app.module.ts", "src/comp-a.component.ts", "src/comp-b.component.ts"]
}
```

# /src/comp-b.component.ts
```ts
import { Component } from '@angular/core';
import { CompA } from './comp-a.component';

@Component({
  selector: 'comp-b',
  template: '<div>CompB</div>',
  standalone: false,
})
export class CompB {
  compA: CompA | null = null;
}
```

# /src/comp-a.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'comp-a',
  template: '@defer { <comp-b></comp-b> }',
  standalone: false,
})
export class CompA {}
```

# /src/app.module.ts
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
