# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["foreign-host.component.ts", "missing-foreign-imports.component.ts", "misplaced-content.component.ts"]
}
```

# /foreign-host.component.ts
```ts
import { Component } from '@angular/core';

export function Widget() {}

// @angular/core does not expose the `ForeignComponent` type this should return.
function frameworkImport(component: {}): Function {
  return () => {};
}

// `Widget` is matched as a foreign component, so it reports neither NG8001 nor NG8002.
@Component({
  selector: 'app-foreign-host',
  template: `<Widget [size]="size" [label]="label" />`,
  // @ts-ignore: @angular/core does not expose the `foreignImports` property.
  foreignImports: [frameworkImport(Widget)],
})
export class ForeignHostComponent {
  size = 'medium';
  label = 'Hello';
}
```

# /missing-foreign-imports.component.ts
```ts
import { Component } from '@angular/core';

// Without `foreignImports`, `Widget` is an unknown element: NG8001 and NG8002 are reported.
@Component({
  selector: 'app-missing-foreign-imports',
  template: `<Widget [size]="size" />`,
})
export class MissingForeignImportsComponent {
  size = 'medium';
}
```

# /misplaced-content.component.ts
```ts
import { Component } from '@angular/core';

export function Widget() {}

// @angular/core does not expose the `ForeignComponent` type this should return.
function frameworkImport(component: {}): Function {
  return () => {};
}

// The foreign component feature analysis still reports a misplaced `@content` block (NG8026).
@Component({
  selector: 'app-misplaced-content',
  template: `
    <Widget [label]="label" />
    <div>@content (orphan) {<span>Misplaced</span>}</div>
  `,
  // @ts-ignore: @angular/core does not expose the `foreignImports` property.
  foreignImports: [frameworkImport(Widget)],
})
export class MisplacedContentComponent {
  label = 'Hello';
}
```
