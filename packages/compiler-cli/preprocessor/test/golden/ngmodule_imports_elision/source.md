# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["shared.ts", "app.component.ts", "app.module.ts"]
}
```

# /shared.ts
```ts
import { NgModule, Directive } from '@angular/core';

@Directive({ selector: '[a]', standalone: false })
export class ADirective {}

@Directive({ selector: '[b]', standalone: false })
export class BDirective {}

@NgModule({ declarations: [ADirective], exports: [ADirective] })
export class AModule {}

@NgModule({ declarations: [BDirective], exports: [BDirective] })
export class BModule {}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<span a b>Hello</span>',
  standalone: false,
})
export class AppComponent {}
```

# /app.module.ts
```ts
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AModule, BModule } from './shared';

// LOCAL mode emits the imports array VERBATIM, keeping an array hole (elision) as an empty
// slot — matching ngtsc, whose `exp.elements.map(...)` includes the OmittedExpression, so
// `ɵinj.imports` is `[AModule, , BModule]` (not `[AModule, BModule]`).
// https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L670-L688
@NgModule({
  imports: [AModule, , BModule],
  declarations: [AppComponent],
})
export class AppModule {}
```
