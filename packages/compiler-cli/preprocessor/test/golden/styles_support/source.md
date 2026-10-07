# /app/test.component.ts
```ts
import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-mixed',
  template: '<div>Mixed</div>',
  styles: ['.mixed { color: red; }'],
  styleUrl: './test.component.css',
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: true
})
export class MixedComponent {}

@Component({
  selector: 'app-urls',
  template: '<div>Urls</div>',
  styleUrls: ['./more.css'],
  standalone: true
})
export class UrlsComponent {}

// This one should trigger an error and NOT have metadata
@Component({
  selector: 'app-error',
  template: '<div>Error</div>',
  styleUrl: './test.component.css',
  styleUrls: ['./more.css'],
  standalone: true
})
export class ErrorComponent {}

@Component({
  selector: 'app-string-styles',
  template: '<div>String Styles</div>',
  styles: '.string { color: green; }',
  standalone: true
})
export class StringStylesComponent {}

@Component({
  selector: 'app-template-styles',
  template: '<div>Template Styles</div>',
  styles: `
    .template {
      color: purple;
      content: "\\n";
    }
  `,
  standalone: true
})
export class TemplateStylesComponent {}

@Component({
  selector: 'app-all-styles',
  template: '<link rel="stylesheet" href="./more.css"><style> .template { color: yellow; } </style> <div>All</div>',
  styles: ['.decorator { color: purple; }'],
  styleUrls: ['./test.component.css'],
  standalone: true
})
export class AllStylesComponent {}

@Component({
  selector: 'app-isolated-shadow-dom',
  template: '<div class="isolated">isolated</div>',
  styles: ['.isolated { color: red; }'],
  styleUrl: './test.component.css',
  encapsulation: ViewEncapsulation.ExperimentalIsolatedShadowDom,
  standalone: true
})
export class IsolatedShadowDomComponent {}
```

# /app/test.component.css
```css
.url { color: blue; }
```

# /app/more.css
```css
.more { color: green; }
```

# /tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node"
  },
  "files": [
    "app/test.component.ts"
  ]
}
```
