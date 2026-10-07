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
    "missing-link-stylesheet.component.ts"
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
