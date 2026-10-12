# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": [
    "dynamic-template.component.ts",
    "missing-template.component.ts",
    "dynamic-template-url.component.ts",
    "missing-link-stylesheet.component.ts",
    "missing-link-stylesheet-template-literal.component.ts"
  ]
}
```

# /dynamic-template.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-dynamic-template',
  standalone: true,
  template: '<div>' + Math.random() + '</div>',
})
export class DynamicTemplateComponent {}
```

# /missing-template.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-missing-template',
  standalone: true,
})
export class MissingTemplateComponent {}
```

# /dynamic-template-url.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-dynamic-template-url',
  standalone: true,
  templateUrl: './app-' + Math.random() + '.html',
})
export class DynamicTemplateUrlComponent {}
```

# /missing-link-stylesheet.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-missing-link-stylesheet',
  standalone: true,
  template: '<link rel="stylesheet" href="./missing.css"><div>Hello</div>',
})
export class MissingLinkStylesheetComponent {}
```

# /missing-link-stylesheet-template-literal.component.ts
```ts
import { Component } from '@angular/core';

// `templateUrl` as a no-substitution template literal: the NG2008 for the stylesheet linked
// from the external template is anchored on the `templateUrl` expression, as in ngtsc.
@Component({
  selector: 'app-missing-link-stylesheet-template-literal',
  standalone: true,
  templateUrl: `./missing-link-stylesheet-template-literal.component.html`,
})
export class MissingLinkStylesheetTemplateLiteralComponent {}
```

# /missing-link-stylesheet-template-literal.component.html
```html
<link rel="stylesheet" href="./missing.css"><div>Hello</div>
```
