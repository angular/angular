# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "es2022",
    "module": "es2022",
    "moduleResolution": "node"
  },
  "files": ["app.component.ts"]
}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';

export function FancyButton() {}

// @angular/core does not expose the `ForeignComponent` type this should return.
function frameworkImport(component: {}): Function {
  return () => {};
}

@Component({
  selector: 'app-root',
  standalone: true,
  template: '<FancyButton [label]="title" />',
  // @ts-ignore: @angular/core does not expose the `foreignImports` property.
  foreignImports: [
    // @ts-ignore: @angular/core does not expose the `ForeignComponent` type this expects.
    frameworkImport(FancyButton),
  ],
})
export class AppComponent {
  title = 'Submit';
}
```
