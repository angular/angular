# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.component.ts", "legacy.component.ts"]
}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';

export function FancyButton() {}
export function GoodButton() {}
declare const Extra: unknown;
declare const other: { Cmp: unknown };
declare const framework: { import(component: {}): Function };

// @angular/core does not expose the `ForeignComponent` type this should return.
function frameworkImport(component: {}, ...rest: unknown[]): Function {
  return () => {};
}

@Component({
  selector: 'app-root',
  standalone: true,
  template: '<div>Hello</div>',
  // @ts-ignore: @angular/core does not expose the `foreignImports` property.
  foreignImports: [
    // Not a call expression.
    FancyButton,
    // Wrong arity.
    frameworkImport(FancyButton, Extra),
    // Callee is not a simple identifier.
    framework.import(FancyButton),
    // Argument is not a simple identifier.
    frameworkImport(other.Cmp),
    // Well-formed: still extracted despite the malformed siblings.
    frameworkImport(GoodButton),
  ],
})
export class AppComponent {}
```

# /legacy.component.ts
```ts
import { Component } from '@angular/core';
import { AppComponent } from './app.component';

@Component({
  selector: 'app-legacy',
  standalone: false,
  template: '<div>Legacy</div>',
  imports: [AppComponent],
})
export class LegacyComponent {}
```
