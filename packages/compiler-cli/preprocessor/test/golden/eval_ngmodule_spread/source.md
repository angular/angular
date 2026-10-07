# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.module.ts", "app.component.ts", "foo.component.ts", "bar.directive.ts"]
}
```

# /foo.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'lib-foo',
  template: '<span>Foo</span>',
  standalone: false,
})
export class FooComponent {}
```

# /bar.directive.ts
```ts
import { Directive } from '@angular/core';

@Directive({
  selector: '[libBar]',
  standalone: false,
})
export class BarDirective {}
```

# /extra.ts
```ts
import { BarDirective } from './bar.directive';

export const EXTRA_DECLARATIONS = [BarDirective];
```

# /app.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<lib-foo libBar></lib-foo>',
  standalone: false,
})
export class AppComponent {}
```

# /app.module.ts
```ts
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { FooComponent } from './foo.component';
import { EXTRA_DECLARATIONS } from './extra';

@NgModule({
  declarations: [AppComponent, FooComponent, ...EXTRA_DECLARATIONS],
})
export class AppModule {}
```
