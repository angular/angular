# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": [
    "src/app.module.ts",
    "src/comp-a.component.ts",
    "src/comp-b.component.ts",
    "src/dir-with-host.directive.ts",
    "src/host.directive.ts"
  ]
}
```

# /src/host.directive.ts
```ts
import { Directive } from '@angular/core';

@Directive({
  selector: '[hostDir]',
  standalone: true,
})
export class HostDir {}
```

# /src/dir-with-host.directive.ts
```ts
import { Directive } from '@angular/core';
import { HostDir } from './host.directive';

@Directive({
  selector: '[dirWithHost]',
  standalone: false,
  hostDirectives: [
    {
      directive: HostDir,
    },
  ],
})
export class DirWithHost {}
```

# /src/comp-a.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'comp-a',
  template: '<div dirWithHost><comp-b></comp-b></div>',
  standalone: false,
})
export class CompA {}
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

# /src/app.module.ts
```ts
import { NgModule } from '@angular/core';
import { CompA } from './comp-a.component';
import { CompB } from './comp-b.component';
import { DirWithHost } from './dir-with-host.directive';

@NgModule({
  declarations: [CompA, CompB, DirWithHost],
  exports: [CompA, CompB, DirWithHost],
})
export class AppModule {}
```
