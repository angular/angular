# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["bindings.component.ts", "content-blocks.component.ts"]
}
```

# /bindings.component.ts
```ts
import { Component } from '@angular/core';

export function FancyButton() {}

// @angular/core does not expose the `ForeignComponent` type this should return.
function frameworkImport(component: {}): Function {
  return () => {};
}

@Component({
  selector: 'app-bindings',
  standalone: true,
  template:
    '<FancyButton (click)="onClick()" #ref [attr.role]="role" [children]="custom">projected</FancyButton>',
  // @ts-ignore: @angular/core does not expose the `foreignImports` property.
  foreignImports: [frameworkImport(FancyButton)],
})
export class BindingsComponent {
  role = 'button';
  custom = 'value';
  onClick() {}
}
```

# /content-blocks.component.ts
```ts
import { Component } from '@angular/core';

export function FancyCard() {}

// @angular/core does not expose the `ForeignComponent` type this should return.
function frameworkImport(component: {}): Function {
  return () => {};
}

@Component({
  selector: 'app-content-blocks',
  standalone: true,
  template: `
    <FancyCard [label]="title">
      @content (header) {<b>First</b>}
      @content (header) {<b>Second</b>}
      @content (label) {<i>Conflicts with the binding</i>}
      @content (children) {<span>Unnecessary</span>}
    </FancyCard>
    <div>@content (orphan) {<span>Misplaced</span>}</div>
  `,
  // @ts-ignore: @angular/core does not expose the `foreignImports` property.
  foreignImports: [frameworkImport(FancyCard)],
})
export class ContentBlocksComponent {
  title = 'Card';
}
```
